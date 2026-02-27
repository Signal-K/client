import SwiftUI

struct PulseMenuBarView: View {
    @EnvironmentObject var viewModel: PulseViewModel
    @Environment(\.openWindow) private var openWindow

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Star Sailors Pulse")
                        .font(.headline)
                    Text("Background survey telemetry")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Button("Open Console") {
                    openWindow(id: "pulse-console")
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)
            }

            HStack(spacing: 10) {
                quickStat("Surveys", value: viewModel.metrics.count, tint: .cyan)
                quickStat("Completions", value: viewModel.recentCompletions.count, tint: .mint)
                quickStat("Insights", value: viewModel.insights.count, tint: .orange)
            }

            if let latest = viewModel.recentCompletions.first {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Latest completion")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                    Text(latest.surveyTitle)
                        .font(.subheadline.weight(.semibold))
                    if let firstAnswer = latest.answers.first {
                        Text(firstAnswer.question + ": " + firstAnswer.response)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(3)
                    }
                }
                .padding(10)
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }

            HStack {
                Button("Refresh") {
                    viewModel.refreshNow()
                }
                .buttonStyle(.bordered)
                .controlSize(.small)

                Spacer()

                Button("Settings") {
                    NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
                }
                .buttonStyle(.borderless)
                .controlSize(.small)
            }
        }
    }

    private func quickStat(_ label: String, value: Int, tint: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text("\(value)")
                .font(.headline.weight(.semibold))
                .foregroundStyle(tint)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(tint.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}
