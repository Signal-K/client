import SwiftUI

struct PulseWidgetView: View {
    @EnvironmentObject var viewModel: PulseViewModel

    private var completionCount: Int {
        viewModel.recentCompletions.count
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                hero

                if viewModel.isLoading {
                    ProgressView("Syncing telemetry...")
                        .controlSize(.small)
                }

                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundStyle(.red)
                }

                overviewGrid
                insightsSection
                completionsSection

                if let updated = viewModel.lastUpdated {
                    Text("Updated \(updated.formatted(date: .abbreviated, time: .shortened))")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
    }

    private var hero: some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: [Color(red: 0.03, green: 0.07, blue: 0.18), Color(red: 0.06, green: 0.22, blue: 0.42), Color(red: 0.02, green: 0.06, blue: 0.09)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Star Sailors Pulse")
                            .font(.title2.weight(.bold))
                            .foregroundStyle(.white)
                        Text("Survey answers, derived themes, and live completion alerts")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.76))
                    }
                    Spacer()
                    Button("Refresh") {
                        viewModel.refreshNow()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.cyan)
                }

                HStack(spacing: 10) {
                    heroStat(label: "Live surveys", value: "\(viewModel.metrics.count)", tint: .cyan)
                    heroStat(label: "Recent completions", value: "\(completionCount)", tint: .mint)
                    heroStat(label: "Insights", value: "\(viewModel.insights.count)", tint: .orange)
                }
            }
            .padding(18)
        }
        .frame(minHeight: 180)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.white.opacity(0.08), lineWidth: 1)
        )
    }

    private var overviewGrid: some View {
        let metrics = Array(viewModel.metrics.prefix(6))
        return VStack(alignment: .leading, spacing: 10) {
            sectionTitle("Survey performance")

            if metrics.isEmpty && !viewModel.isLoading {
                emptyState("No survey telemetry yet.")
            } else {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    ForEach(metrics) { metric in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                capsule(metric.kind.rawValue, tint: metric.kind == .mechanic ? .mint : .cyan)
                                Spacer()
                                Text("\(Int(metric.completionRate * 100))%")
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(.orange)
                            }

                            Text(metric.title)
                                .font(.headline)
                                .foregroundStyle(.primary)
                                .lineLimit(2)

                            HStack {
                                statText("Shown", metric.shown)
                                Spacer()
                                statText("Done", metric.completed)
                            }
                        }
                        .padding(14)
                        .background(Color.white.opacity(0.05))
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    }
                }
            }
        }
    }

    private var insightsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionTitle("Derived insights")
            if viewModel.insights.isEmpty && !viewModel.isLoading {
                emptyState("No completed responses to summarise yet.")
            } else {
                ForEach(viewModel.insights.prefix(6)) { insight in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(insight.surveyTitle)
                                .font(.headline)
                            Spacer()
                            capsule("\(insight.totalCompletions) complete", tint: .orange)
                        }

                        ForEach(insight.highlights, id: \.self) { highlight in
                            Text("• \(highlight)")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(14)
                    .background(Color.white.opacity(0.04))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
            }
        }
    }

    private var completionsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionTitle("Recent answers")
            if viewModel.recentCompletions.isEmpty && !viewModel.isLoading {
                emptyState("No successful completions captured yet.")
            } else {
                ForEach(viewModel.recentCompletions.prefix(12)) { completion in
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(completion.surveyTitle)
                                    .font(.headline)
                                Text(completion.timestamp.formatted(date: .abbreviated, time: .shortened))
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            capsule(completion.kind.rawValue, tint: completion.kind == .mechanic ? .mint : .cyan)
                        }

                        ForEach(completion.answers.prefix(3)) { answer in
                            VStack(alignment: .leading, spacing: 2) {
                                Text(answer.question)
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(.secondary)
                                Text(answer.response)
                                    .font(.callout)
                                    .foregroundStyle(.primary)
                            }
                        }
                    }
                    .padding(14)
                    .background(Color.white.opacity(0.04))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
            }
        }
    }

    private func heroStat(label: String, value: String, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.72))
            Text(value)
                .font(.title3.weight(.bold))
                .foregroundStyle(.white)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(tint.opacity(0.14))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private func capsule(_ label: String, tint: Color) -> some View {
        Text(label)
            .font(.caption2.weight(.bold))
            .padding(.horizontal, 8)
            .padding(.vertical, 5)
            .background(tint.opacity(0.18))
            .foregroundStyle(tint)
            .clipShape(Capsule())
    }

    private func statText(_ label: String, _ value: Int) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text("\(value)")
                .font(.subheadline.weight(.semibold))
        }
    }

    private func sectionTitle(_ title: String) -> some View {
        Text(title)
            .font(.title3.weight(.semibold))
    }

    private func emptyState(_ message: String) -> some View {
        Text(message)
            .font(.caption)
            .foregroundStyle(.secondary)
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white.opacity(0.04))
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}
