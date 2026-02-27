import Foundation

enum SurveyMetricKind: String {
    case mechanic = "Mechanic"
    case posthog = "PostHog"
}

struct SurveyMetric: Identifiable {
    let id: String
    let title: String
    let kind: SurveyMetricKind
    var shown: Int
    var submitted: Int
    var completed: Int
    var dismissed: Int

    var completionRate: Double {
        guard shown > 0 else { return 0 }
        return Double(max(completed, submitted)) / Double(shown)
    }
}

struct SurveyQuestionAnswer: Identifiable, Hashable {
    let id: String
    let question: String
    let response: String
}

struct SurveyCompletion: Identifiable, Hashable {
    let id: String
    let surveyId: String
    let surveyTitle: String
    let kind: SurveyMetricKind
    let timestamp: Date
    let distinctId: String
    let answers: [SurveyQuestionAnswer]
    let sessionRecordingURL: String?
}

struct SurveyInsight: Identifiable, Hashable {
    let id: String
    let surveyId: String
    let surveyTitle: String
    let kind: SurveyMetricKind
    let totalCompletions: Int
    let highlights: [String]
}

struct PulseSnapshot {
    let metrics: [SurveyMetric]
    let completions: [SurveyCompletion]
    let insights: [SurveyInsight]
}

struct PulseConfig {
    var host: String
    var projectId: String
    var personalApiKey: String
    var refreshIntervalSeconds: Double

    static func bundled(from bundle: Bundle = .main) -> PulseConfig {
        let refreshValue = bundle.object(forInfoDictionaryKey: "STARSAILORS_PULSE_REFRESH_INTERVAL")
        let refreshInterval: Double
        if let value = refreshValue as? Double {
            refreshInterval = value
        } else if let value = refreshValue as? String, let parsed = Double(value) {
            refreshInterval = parsed
        } else {
            refreshInterval = 60
        }

        return PulseConfig(
            host: bundle.object(forInfoDictionaryKey: "STARSAILORS_POSTHOG_HOST") as? String ?? "us.posthog.com",
            projectId: bundle.object(forInfoDictionaryKey: "STARSAILORS_POSTHOG_PROJECT_ID") as? String ?? "199773",
            personalApiKey: bundle.object(forInfoDictionaryKey: "STARSAILORS_POSTHOG_PERSONAL_API_KEY") as? String ?? "",
            refreshIntervalSeconds: refreshInterval
        )
    }
}

final class PostHogService {
    struct EventEnvelope: Decodable {
        let id: String
        let distinct_id: String?
        let event: String
        let timestamp: String?
        let properties: [String: PropertyValue]?
    }

    struct SurveysResponse: Decodable {
        let results: [SurveyDefinition]
    }

    struct SurveyDefinition: Decodable {
        let id: String
        let name: String?
        let archived: Bool?
    }

    struct QuestionPayload: Decodable {
        let id: String?
        let question: String?
        let response: PropertyValue?
    }

    enum PropertyValue: Decodable {
        case string(String)
        case bool(Bool)
        case number(Double)
        case strings([String])
        case questions([QuestionPayload])
        case unknown

        init(from decoder: Decoder) throws {
            let container = try decoder.singleValueContainer()
            if let value = try? container.decode(String.self) {
                self = .string(value)
                return
            }
            if let value = try? container.decode(Bool.self) {
                self = .bool(value)
                return
            }
            if let value = try? container.decode(Double.self) {
                self = .number(value)
                return
            }
            if let value = try? container.decode([String].self) {
                self = .strings(value)
                return
            }
            if let value = try? container.decode([QuestionPayload].self) {
                self = .questions(value)
                return
            }
            self = .unknown
        }

        var stringValue: String? {
            switch self {
            case let .string(value):
                return value
            case let .number(value):
                if value.rounded() == value {
                    return String(Int(value))
                }
                return String(value)
            case let .bool(value):
                return value ? "Yes" : "No"
            case let .strings(values):
                return values.joined(separator: ", ")
            default:
                return nil
            }
        }

        var boolValue: Bool? {
            if case let .bool(value) = self { return value }
            return nil
        }

        var questionsValue: [QuestionPayload]? {
            if case let .questions(value) = self { return value }
            return nil
        }
    }

    struct EventsResponse: Decodable {
        let results: [EventEnvelope]
    }

    func fetchSnapshot(config: PulseConfig) async throws -> PulseSnapshot {
        async let surveys = fetchSurveys(config: config)
        async let surveyShownEvents = fetchEvents(config: config, event: "survey shown", limit: 200)
        async let surveySentEvents = fetchEvents(config: config, event: "survey sent", limit: 200)
        async let mechanicShownEvents = fetchEvents(config: config, event: "mechanic_micro_survey_shown", limit: 200)
        async let mechanicSubmittedEvents = fetchEvents(config: config, event: "mechanic_micro_survey_submitted", limit: 200)
        async let mechanicDismissedEvents = fetchEvents(config: config, event: "mechanic_micro_survey_dismissed", limit: 200)

        let surveyDefinitions = try await surveys
        let shown = try await surveyShownEvents
        let sent = try await surveySentEvents
        let mechanicShown = try await mechanicShownEvents
        let mechanicSubmitted = try await mechanicSubmittedEvents
        let mechanicDismissed = try await mechanicDismissedEvents

        var aggregate: [String: SurveyMetric] = [:]

        func upsert(_ id: String, defaultTitle: String, kind: SurveyMetricKind, update: (inout SurveyMetric) -> Void) {
            var metric = aggregate[id] ?? SurveyMetric(
                id: id,
                title: defaultTitle,
                kind: kind,
                shown: 0,
                submitted: 0,
                completed: 0,
                dismissed: 0
            )
            update(&metric)
            aggregate[id] = metric
        }

        for survey in surveyDefinitions where survey.archived != true {
            upsert(survey.id, defaultTitle: survey.name ?? survey.id, kind: .posthog) { _ in }
        }

        for event in shown {
            let surveyId = event.properties?["$survey_id"]?.stringValue ?? event.properties?["survey_id"]?.stringValue
            let surveyName = event.properties?["$survey_name"]?.stringValue ?? surveyId ?? "Unknown survey"
            guard let surveyId else { continue }
            upsert(surveyId, defaultTitle: surveyName, kind: .posthog) { $0.shown += 1 }
        }

        var completions: [SurveyCompletion] = []
        for event in sent {
            let surveyId = event.properties?["$survey_id"]?.stringValue ?? event.properties?["survey_id"]?.stringValue
            let surveyName = event.properties?["$survey_name"]?.stringValue ?? surveyId ?? "Unknown survey"
            guard let surveyId else { continue }

            let completed = event.properties?["$survey_completed"]?.boolValue == true
            upsert(surveyId, defaultTitle: surveyName, kind: .posthog) {
                $0.submitted += 1
                if completed {
                    $0.completed += 1
                }
            }

            guard completed else { continue }
            completions.append(makePostHogCompletion(from: event, surveyId: surveyId, surveyTitle: surveyName))
        }

        for event in mechanicShown {
            guard let surveyId = event.properties?["survey_id"]?.stringValue else { continue }
            let surveyName = event.properties?["survey_title"]?.stringValue ?? surveyId
            upsert(surveyId, defaultTitle: surveyName, kind: .mechanic) { $0.shown += 1 }
        }

        for event in mechanicSubmitted {
            guard let surveyId = event.properties?["survey_id"]?.stringValue else { continue }
            let surveyName = event.properties?["survey_title"]?.stringValue ?? surveyId
            upsert(surveyId, defaultTitle: surveyName, kind: .mechanic) {
                $0.submitted += 1
                $0.completed += 1
            }
            completions.append(makeMechanicCompletion(from: event, surveyId: surveyId, surveyTitle: surveyName))
        }

        for event in mechanicDismissed {
            guard let surveyId = event.properties?["survey_id"]?.stringValue else { continue }
            let surveyName = event.properties?["survey_title"]?.stringValue ?? surveyId
            upsert(surveyId, defaultTitle: surveyName, kind: .mechanic) { $0.dismissed += 1 }
        }

        let metrics = aggregate.values.sorted {
            if $0.kind != $1.kind {
                return $0.kind.rawValue < $1.kind.rawValue
            }
            return $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending
        }

        let orderedCompletions = completions.sorted { $0.timestamp > $1.timestamp }
        let insights = buildInsights(from: orderedCompletions)

        return PulseSnapshot(
            metrics: metrics,
            completions: orderedCompletions,
            insights: insights
        )
    }

    private func makePostHogCompletion(from event: EventEnvelope, surveyId: String, surveyTitle: String) -> SurveyCompletion {
        let answers = event.properties?["$survey_questions"]?.questionsValue?.compactMap { payload -> SurveyQuestionAnswer? in
            guard let question = payload.question, !question.isEmpty else { return nil }
            guard let response = payload.response?.stringValue, !response.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
                return nil
            }
            return SurveyQuestionAnswer(
                id: payload.id ?? UUID().uuidString,
                question: question,
                response: response
            )
        } ?? []

        return SurveyCompletion(
            id: event.id,
            surveyId: surveyId,
            surveyTitle: surveyTitle,
            kind: .posthog,
            timestamp: parseTimestamp(event.timestamp),
            distinctId: event.distinct_id ?? "unknown",
            answers: answers,
            sessionRecordingURL: event.properties?["sessionRecordingUrl"]?.stringValue
        )
    }

    private func makeMechanicCompletion(from event: EventEnvelope, surveyId: String, surveyTitle: String) -> SurveyCompletion {
        var answers: [SurveyQuestionAnswer] = []
        if let overall = event.properties?["overall_score"]?.stringValue {
            answers.append(SurveyQuestionAnswer(id: "overall_score", question: "Overall score", response: overall))
        }
        if let favorite = event.properties?["favorite_part"]?.stringValue {
            answers.append(SurveyQuestionAnswer(id: "favorite_part", question: "Favorite part", response: favorite))
        }
        if let friction = event.properties?["friction_point"]?.stringValue {
            answers.append(SurveyQuestionAnswer(id: "friction_point", question: "Friction point", response: friction))
        }
        if let notes = event.properties?["free_text"]?.stringValue, !notes.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            answers.append(SurveyQuestionAnswer(id: "free_text", question: "Notes", response: notes))
        }
        if answers.isEmpty {
            let properties = event.properties ?? [:]
            let ignoredKeys: Set<String> = ["survey_id", "survey_title", "starsailors_session_token", "$lib", "$host", "$current_url", "$pathname", "$session_id"]
            for key in properties.keys.sorted() where !ignoredKeys.contains(key) {
                guard let value = properties[key]?.stringValue, !value.isEmpty else { continue }
                answers.append(SurveyQuestionAnswer(id: key, question: key.replacingOccurrences(of: "_", with: " "), response: value))
            }
        }

        return SurveyCompletion(
            id: event.id,
            surveyId: surveyId,
            surveyTitle: surveyTitle,
            kind: .mechanic,
            timestamp: parseTimestamp(event.timestamp),
            distinctId: event.distinct_id ?? "unknown",
            answers: answers,
            sessionRecordingURL: nil
        )
    }

    private func buildInsights(from completions: [SurveyCompletion]) -> [SurveyInsight] {
        let grouped = Dictionary(grouping: completions, by: \.surveyId)
        return grouped.compactMap { surveyId, responses in
            guard let first = responses.first else { return nil }
            var answerCounts: [String: [String: Int]] = [:]

            for completion in responses {
                for answer in completion.answers {
                    let normalized = answer.response.trimmingCharacters(in: .whitespacesAndNewlines)
                    guard !normalized.isEmpty else { continue }
                    answerCounts[answer.question, default: [:]][normalized, default: 0] += 1
                }
            }

            let highlights = answerCounts.keys.sorted().compactMap { question -> String? in
                guard let top = answerCounts[question]?.max(by: { lhs, rhs in lhs.value < rhs.value }) else { return nil }
                return "\(question): \(top.key) (\(top.value))"
            }

            return SurveyInsight(
                id: surveyId,
                surveyId: surveyId,
                surveyTitle: first.surveyTitle,
                kind: first.kind,
                totalCompletions: responses.count,
                highlights: Array(highlights.prefix(3))
            )
        }
        .sorted { lhs, rhs in
            if lhs.kind != rhs.kind { return lhs.kind.rawValue < rhs.kind.rawValue }
            if lhs.totalCompletions != rhs.totalCompletions { return lhs.totalCompletions > rhs.totalCompletions }
            return lhs.surveyTitle.localizedCaseInsensitiveCompare(rhs.surveyTitle) == .orderedAscending
        }
    }

    private func parseTimestamp(_ value: String?) -> Date {
        guard let value else { return Date() }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: value) {
            return date
        }
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: value) ?? Date()
    }

    private func fetchSurveys(config: PulseConfig) async throws -> [SurveyDefinition] {
        guard !config.personalApiKey.isEmpty else { return [] }
        let urlString = "https://\(config.host)/api/projects/\(config.projectId)/surveys/?limit=100"
        guard let url = URL(string: urlString) else { throw URLError(.badURL) }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(config.personalApiKey)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200..<300).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }

        return try JSONDecoder().decode(SurveysResponse.self, from: data).results
    }

    private func fetchEvents(config: PulseConfig, event: String, limit: Int) async throws -> [EventEnvelope] {
        guard !config.personalApiKey.isEmpty else { return [] }
        let encodedEvent = event.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? event
        let urlString = "https://\(config.host)/api/projects/\(config.projectId)/events/?event=\(encodedEvent)&limit=\(limit)"
        guard let url = URL(string: urlString) else { throw URLError(.badURL) }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(config.personalApiKey)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200..<300).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }

        return try JSONDecoder().decode(EventsResponse.self, from: data).results
    }
}
