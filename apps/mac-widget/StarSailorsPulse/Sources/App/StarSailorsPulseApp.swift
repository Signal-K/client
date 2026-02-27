import SwiftUI

@main
struct StarSailorsPulseApp: App {
    @StateObject private var viewModel = PulseViewModel()

    var body: some Scene {
        WindowGroup("Star Sailors Pulse", id: "pulse-console") {
            PulseWidgetView()
                .environmentObject(viewModel)
                .frame(minWidth: 420, minHeight: 520)
                .padding(16)
        }

        MenuBarExtra("Star Sailors Pulse", systemImage: "gauge.with.dots.needle.67percent") {
            PulseMenuBarView()
                .environmentObject(viewModel)
                .frame(width: 380)
                .padding(12)
        }
        .menuBarExtraStyle(.window)

        Settings {
            PulseSettingsView()
                .environmentObject(viewModel)
                .frame(minWidth: 480, minHeight: 360)
                .padding(16)
        }
    }
}
