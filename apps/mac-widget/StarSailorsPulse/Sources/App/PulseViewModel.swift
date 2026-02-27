import Foundation
import UserNotifications

@MainActor
final class PulseViewModel: ObservableObject {
    @Published var config: PulseConfig
    @Published var metrics: [SurveyMetric] = []
    @Published var recentCompletions: [SurveyCompletion] = []
    @Published var insights: [SurveyInsight] = []
    @Published var isLoading = false
    @Published var lastUpdated: Date?
    @Published var errorMessage: String?

    private let service = PostHogService()
    private var refreshTask: Task<Void, Never>?

    private enum Keys {
        static let refresh = "pulse_refresh_interval"
        static let seenCompletionIds = "pulse_seen_completion_ids"
    }

    init() {
        let defaults = UserDefaults.standard
        let bundled = PulseConfig.bundled()
        config = PulseConfig(
            host: bundled.host,
            projectId: bundled.projectId,
            personalApiKey: bundled.personalApiKey,
            refreshIntervalSeconds: defaults.double(forKey: Keys.refresh) > 0
                ? defaults.double(forKey: Keys.refresh)
                : bundled.refreshIntervalSeconds
        )

        Task {
            try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge])
        }

        startAutoRefresh()
    }

    func saveConfig() {
        let defaults = UserDefaults.standard
        defaults.set(config.refreshIntervalSeconds, forKey: Keys.refresh)

        startAutoRefresh()
    }

    func refreshNow() {
        refreshTask?.cancel()
        refreshTask = Task { await refresh() }
    }

    private func startAutoRefresh() {
        refreshTask?.cancel()
        refreshTask = Task {
            await refresh()
            while !Task.isCancelled {
                let nanos = UInt64(max(config.refreshIntervalSeconds, 15) * 1_000_000_000)
                try? await Task.sleep(nanoseconds: nanos)
                await refresh()
            }
        }
    }

    private func refresh() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let snapshot = try await service.fetchSnapshot(config: config)
            metrics = snapshot.metrics
            recentCompletions = Array(snapshot.completions.prefix(20))
            insights = snapshot.insights
            notifyForNewCompletions(snapshot.completions)
            lastUpdated = Date()
        } catch {
            errorMessage = "Could not load PostHog metrics from bundled credentials."
        }
    }

    private func notifyForNewCompletions(_ completions: [SurveyCompletion]) {
        let defaults = UserDefaults.standard
        let seen = Set(defaults.stringArray(forKey: Keys.seenCompletionIds) ?? [])

        let newCompletions = completions
            .filter { !seen.contains($0.id) }
            .sorted { $0.timestamp < $1.timestamp }

        guard !newCompletions.isEmpty else { return }

        for completion in newCompletions {
            let content = UNMutableNotificationContent()
            content.title = "Survey completed"
            content.subtitle = completion.surveyTitle
            if let firstAnswer = completion.answers.first {
                content.body = "\(firstAnswer.question): \(firstAnswer.response)"
            } else {
                content.body = "A new \(completion.kind.rawValue.lowercased()) completion was recorded."
            }
            content.sound = .default

            let request = UNNotificationRequest(
                identifier: completion.id,
                content: content,
                trigger: nil
            )
            UNUserNotificationCenter.current().add(request)
        }

        let stored = Array(Set(seen.union(newCompletions.map(\.id))).suffix(500))
        defaults.set(stored, forKey: Keys.seenCompletionIds)
    }
}
