import AppKit

let output = URL(fileURLWithPath: CommandLine.arguments[1])
let size: CGFloat = 1024
let image = NSImage(size: NSSize(width: size, height: size))

image.lockFocus()
let rect = NSRect(x: 0, y: 0, width: size, height: size)

let gradient = NSGradient(colors: [
    NSColor(calibratedRed: 0.02, green: 0.05, blue: 0.12, alpha: 1.0),
    NSColor(calibratedRed: 0.04, green: 0.18, blue: 0.34, alpha: 1.0),
    NSColor(calibratedRed: 0.02, green: 0.09, blue: 0.14, alpha: 1.0),
])!
gradient.draw(in: rect, angle: -45)

let framePath = NSBezierPath(roundedRect: rect.insetBy(dx: 54, dy: 54), xRadius: 220, yRadius: 220)
NSColor(calibratedWhite: 1.0, alpha: 0.05).setFill()
framePath.fill()

let stars: [(CGFloat, CGFloat, CGFloat, CGFloat)] = [
    (148, 814, 8, 0.42), (224, 692, 10, 0.60), (296, 860, 6, 0.35), (348, 754, 9, 0.48),
    (412, 894, 7, 0.30), (598, 846, 11, 0.55), (702, 776, 8, 0.40), (816, 866, 6, 0.36),
    (854, 690, 9, 0.45), (742, 590, 7, 0.32), (880, 514, 10, 0.52), (170, 566, 7, 0.38),
    (112, 462, 8, 0.44), (256, 438, 10, 0.58), (836, 384, 7, 0.29), (732, 300, 9, 0.41),
    (618, 238, 8, 0.34), (304, 248, 10, 0.50)
]
for (x, y, dimension, alpha) in stars {
    let starRect = NSRect(x: x, y: y, width: dimension, height: dimension)
    NSColor(calibratedWhite: 1.0, alpha: alpha).setFill()
    NSBezierPath(ovalIn: starRect).fill()
}

let planetRect = NSRect(x: 170, y: 162, width: 690, height: 690)
let planetGradient = NSGradient(colors: [
    NSColor(calibratedRed: 0.10, green: 0.32, blue: 0.58, alpha: 1.0),
    NSColor(calibratedRed: 0.02, green: 0.15, blue: 0.28, alpha: 1.0),
])!
planetGradient.draw(in: NSBezierPath(ovalIn: planetRect), angle: -65)

let glowRect = NSRect(x: 210, y: 202, width: 610, height: 610)
NSColor(calibratedRed: 0.34, green: 0.86, blue: 0.92, alpha: 0.18).setFill()
NSBezierPath(ovalIn: glowRect).fill()

let radarRing = NSBezierPath()
radarRing.lineWidth = 28
NSColor(calibratedRed: 0.45, green: 0.96, blue: 0.92, alpha: 0.78).setStroke()
radarRing.appendArc(withCenter: NSPoint(x: 512, y: 510), radius: 255, startAngle: 14, endAngle: 338)
radarRing.stroke()

let innerRing = NSBezierPath()
innerRing.lineWidth = 12
NSColor(calibratedRed: 0.92, green: 0.99, blue: 1.0, alpha: 0.34).setStroke()
innerRing.appendArc(withCenter: NSPoint(x: 512, y: 510), radius: 182, startAngle: 30, endAngle: 330)
innerRing.stroke()

let sweep = NSBezierPath()
sweep.move(to: NSPoint(x: 512, y: 510))
sweep.line(to: NSPoint(x: 760, y: 630))
sweep.line(to: NSPoint(x: 707, y: 714))
sweep.close()
NSColor(calibratedRed: 0.42, green: 0.97, blue: 0.92, alpha: 0.22).setFill()
sweep.fill()

let beacon = NSBezierPath(ovalIn: NSRect(x: 478, y: 476, width: 68, height: 68))
NSColor(calibratedRed: 0.98, green: 0.74, blue: 0.25, alpha: 1.0).setFill()
beacon.fill()

let hull = NSBezierPath(roundedRect: NSRect(x: 392, y: 282, width: 248, height: 112), xRadius: 56, yRadius: 56)
NSColor(calibratedRed: 0.93, green: 0.98, blue: 1.0, alpha: 0.94).setFill()
hull.fill()

let cockpit = NSBezierPath(roundedRect: NSRect(x: 452, y: 316, width: 128, height: 44), xRadius: 22, yRadius: 22)
NSColor(calibratedRed: 0.05, green: 0.16, blue: 0.28, alpha: 0.9).setFill()
cockpit.fill()

let fin = NSBezierPath()
fin.move(to: NSPoint(x: 630, y: 342))
fin.line(to: NSPoint(x: 740, y: 398))
fin.line(to: NSPoint(x: 638, y: 296))
fin.close()
NSColor(calibratedRed: 0.98, green: 0.74, blue: 0.25, alpha: 0.96).setFill()
fin.fill()

let trail = NSBezierPath()
trail.move(to: NSPoint(x: 392, y: 338))
trail.curve(to: NSPoint(x: 232, y: 388), controlPoint1: NSPoint(x: 318, y: 388), controlPoint2: NSPoint(x: 278, y: 420))
trail.curve(to: NSPoint(x: 224, y: 304), controlPoint1: NSPoint(x: 198, y: 364), controlPoint2: NSPoint(x: 198, y: 326))
trail.curve(to: NSPoint(x: 392, y: 328), controlPoint1: NSPoint(x: 262, y: 286), controlPoint2: NSPoint(x: 324, y: 300))
NSColor(calibratedRed: 0.99, green: 0.50, blue: 0.18, alpha: 0.72).setFill()
trail.fill()

image.unlockFocus()

let data = image.tiffRepresentation!
let rep = NSBitmapImageRep(data: data)!
let png = rep.representation(using: .png, properties: [:])!
try png.write(to: output)
