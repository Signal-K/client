import WidgetKit
import SwiftUI

struct PulseWidgetEntry: TimelineEntry {
    let date: Date
    let totals: PulseWidgetTotals
    let topMetrics: [SurveyMetric]
    let latestCompletion: SurveyCompletion?
    let errorMessage: String?
}

struct PulseWidgetTotals {
    let surveys: Int
    let shown: Int
    let completed: Int
    let dismissed: Int

    static let empty = PulseWidgetTotals(surveys: 0, shown: 0, completed: 0, dismissed: 0)
}

struct PulseProvider: TimelineProvider {
    private let service = PostHogService()

    func placeholder(in context: Context) -> PulseWidgetEntry {
        PulseWidgetEntry(
            date: Date(),
            totals: PulseWidgetTotals(surveys: 6, shown: 84, completed: 39, dismissed: 12),
            topMetrics: [
                SurveyMetric(id: "mechanic_telescope_loop_v1", title: "Telescope Debrief", kind: .mechanic, shown: 20, submitted: 12, completed: 12, dismissed: 2),
                SurveyMetric(id: "mechanic_rover_loop_v1", title: "Rover Debrief", kind: .mechanic, shown: 18, submitted: 9, completed: 9, dismissed: 3),
                SurveyMetric(id: "ecosystem_intro_v1", title: "Ecosystem Survey", kind: .posthog, shown: 16, submitted: 8, completed: 6, dismissed: 4)
            ],
            latestCompletion: SurveyCompletion(
                id: "preview",
                surveyId: "mechanic_telescope_loop_v1",
                surveyTitle: "Telescope Debrief",
                kind: .mechanic,
                timestamp: Date(),
                distinctId: "preview",
                answers: [SurveyQuestionAnswer(id: "favorite", question: "Favorite part", response: "Scanning the sky map")],
                sessionRecordingURL: nil
            ),
            errorMessage: nil
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PulseWidgetEntry) -> Void) {
        Task {
            completion(await loadEntry())
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PulseWidgetEntry>) -> Void) {
        Task {
            let entry = await loadEntry()
            let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date().addingTimeInterval(900)
            completion(Timeline(entries: [entry], policy: .after(next)))
        }
    }

    private func loadEntry() async -> PulseWidgetEntry {
        let config = PulseConfig.bundled()
        do {
            let snapshot = try await service.fetchSnapshot(config: config)
            let metrics = snapshot.metrics
            let totals = PulseWidgetTotals(
                surveys: metrics.count,
                shown: metrics.reduce(0) { $0 + $1.shown },
                completed: metrics.reduce(0) { $0 + $1.completed },
                dismissed: metrics.reduce(0) { $0 + $1.dismissed }
            )

            let topMetrics = metrics.sorted {
                if $0.shown != $1.shown { return $0.shown > $1.shown }
                return $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending
            }

            return PulseWidgetEntry(
                date: Date(),
                totals: totals,
                topMetrics: Array(topMetrics.prefix(3)),
                latestCompletion: snapshot.completions.first,
                errorMessage: nil
            )
        } catch {
            return PulseWidgetEntry(
                date: Date(),
                totals: .empty,
                topMetrics: [],
                latestCompletion: nil,
                errorMessage: "Telemetry offline"
            )
        }
    }
}

struct PulseDesktopWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: PulseWidgetEntry

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.04, green: 0.09, blue: 0.18), Color(red: 0.07, green: 0.18, blue: 0.32), Color(red: 0.01, green: 0.03, blue: 0.08)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 10) {
                header
                if let errorMessage = entry.errorMessage {
                    errorState(errorMessage)
                } else if family == .systemSmall {
                    smallContent
                } else {
                    mediumContent
                }
                Spacer(minLength: 0)
                footer
            }
            .padding(14)
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("Star Sailors")
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.7))
            Text("Survey Pulse")
                .font(.headline.weight(.semibold))
                .foregroundStyle(.white)
        }
    }

    private var smallContent: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text("\(entry.totals.completed)")
                    .font(.system(size: 34, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                Text("done")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.mint)
            }

            statLine(label: "Live surveys", value: "\(entry.totals.surveys)")
            statLine(label: "Shown", value: "\(entry.totals.shown)")

            if let latest = entry.latestCompletion, let firstAnswer = latest.answers.first {
                VStack(alignment: .leading, spacing: 3) {
                    Text(latest.surveyTitle)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white)
                        .lineLimit(1)
                    Text(firstAnswer.response)
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.72))
                        .lineLimit(2)
                }
                .padding(8)
                .background(Color.white.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }
        }
    }

    private var mediumContent: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                metricBadge(label: "Surveys", value: entry.totals.surveys, tint: .cyan)
                metricBadge(label: "Shown", value: entry.totals.shown, tint: .mint)
                metricBadge(label: "Done", value: entry.totals.completed, tint: .orange)
            }

            if let latest = entry.latestCompletion, let firstAnswer = latest.answers.first {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Latest completion")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.82))
                    Text(latest.surveyTitle)
                        .font(.caption)
                        .foregroundStyle(.white)
                    Text(firstAnswer.question + ": " + firstAnswer.response)
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.72))
                        .lineLimit(2)
                }
                .padding(10)
                .background(Color.white.opacity(0.07))
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Top activity")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.82))

                ForEach(entry.topMetrics) { metric in
                    HStack(spacing: 8) {
                        Text(metric.kind == .mechanic ? "M" : "P")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(.black.opacity(0.8))
                            .frame(width: 18, height: 18)
                            .background(metric.kind == .mechanic ? Color.mint : Color.cyan)
                            .clipShape(Circle())
                        VStack(alignment: .leading, spacing: 1) {
                            Text(metric.title)
                                .font(.caption)
                                .foregroundStyle(.white)
                                .lineLimit(1)
                            Text("\(metric.shown) shown • \(metric.completed) completed")
                                .font(.caption2)
                                .foregroundStyle(.white.opacity(0.72))
                        }
                        Spacer()
                    }
                }
            }
        }
    }

    private var footer: some View {
        HStack {
            Text(entry.date, style: .time)
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.65))
            Spacer()
            Text("Desktop widget")
                .font(.caption2)
                .foregroundStyle(.cyan.opacity(0.9))
        }
    }

    private func errorState(_ message: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(message)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.orange)
            Text("Open the Star Sailors Pulse app to confirm bundled credentials and refresh telemetry.")
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.72))
        }
    }

    private func statLine(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.72))
            Spacer()
            Text(value)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.white)
        }
    }

    private func metricBadge(label: String, value: Int, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.72))
            Text("\(value)")
                .font(.headline.weight(.semibold))
                .foregroundStyle(.white)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(8)
        .background(tint.opacity(0.16))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(tint.opacity(0.45), lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

struct StarSailorsPulseWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "StarSailorsPulseWidget", provider: PulseProvider()) { entry in
            PulseDesktopWidgetView(entry: entry)
        }
        .configurationDisplayName("Star Sailors Pulse")
        .description("Live survey telemetry for desktop and Notification Center.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct StarSailorsPulseWidgetBundle: WidgetBundle {
    var body: some Widget {
        StarSailorsPulseWidget()
    }
}
