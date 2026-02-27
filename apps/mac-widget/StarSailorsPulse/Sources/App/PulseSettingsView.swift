import SwiftUI

struct PulseSettingsView: View {
    @EnvironmentObject var viewModel: PulseViewModel

    var body: some View {
        Form {
            Section("Bundled Connection") {
                LabeledContent("Host", value: viewModel.config.host)
                LabeledContent("Project ID", value: viewModel.config.projectId)
                LabeledContent("API Key", value: "Bundled in app")
                HStack {
                    Text("Refresh interval")
                    Slider(value: $viewModel.config.refreshIntervalSeconds, in: 15...300, step: 15)
                    Text("\(Int(viewModel.config.refreshIntervalSeconds))s")
                        .monospacedDigit()
                }
            }

            Section("Actions") {
                HStack {
                    Button("Save refresh interval") {
                        viewModel.saveConfig()
                    }
                    .buttonStyle(.borderedProminent)

                    Button("Refresh now") {
                        viewModel.refreshNow()
                    }
                    .buttonStyle(.bordered)
                }
            }

            Section("Notes") {
                Text("This app and the desktop widget both read PostHog directly using credentials bundled into the app.")
                    .font(.caption)
                Text("The only runtime preference stored locally is the refresh interval.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}
