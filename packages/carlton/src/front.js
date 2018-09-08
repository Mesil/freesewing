import { calculateRatios } from "./shared";

export default function(part) {
  let { paperless, sa, snippets, Snippet, utils, store, complete, points, measurements, options, macro, Point, paths, Path } = part.shorthand();

  calculateRatios(part);

  // Waist shaping
  points.waist = points.cfWaist.shift(0, store.get("chest")/4 - store.get("waistReduction")/8);
  points.waistCp1 = points.waist.shift(-90, points.waist.dy(points.hips)/2);
  points.waistCp2 = points.waist.shift(90, points.armhole.dy(points.waist)/2);

  // Seat shaping
  points.cfSeat = points.cfWaist.shift(-90, measurements.naturalWaistToSeat);
  points.seat = points.cfSeat.shift(0, store.get("seat")/4);
  points.seatCp2 = points.seat.shift(90, points.waist.dy(points.seat)/3);

  // Hem length
  points.cfHem = points.cfWaist.shift(-90, measurements.naturalWaistToFloor * options.length);
  points.hem = new Point(
    points.seat.x,
    points.cfHem.y
  );
  store.set("waistToHem", points.cfHem.y - points.waist.y);

  // Buttonline
  let buttonW = points.waist.x * options.buttonSpacingHorizontal;
  let buttonH = points.waist.dy(points.hips) / 1.5;
  points.button1Left = points.cfHips.shift(180, buttonW / 2);
  points.button1Right = points.cfHips.shift(0, buttonW / 2);
  points.button2Left = points.button1Left.shift(90, buttonH);
  points.button2Right = points.button2Left.shift(0, buttonW);
  points.button3Left = points.button2Left.shift(90, buttonH);
  points.button3Right = points.button3Left.shift(0, buttonW);

  // Front closure edge
  points.collarEdge = new Point(
    points.button1Left.x - measurements.naturalWaist * options.frontOverlap,
    points.cfNeck.y
  );
  points.hemEdge = new Point(
    points.collarEdge.x,
    points.hem.y
  );

  // Collar
  points.collarTip = points.collarEdge.shiftFractionTowards(points.cfNeck, options.lapelReduction);
  points.lapelStraightEnd = new Point(
    points.collarEdge.x,
    points.armhole.y
  );
  points.lapelStraightEndCp1 = points.lapelStraightEnd.shiftFractionTowards(points.collarEdge, 0.7);

  // Pocket
  points.pocketTopLeft = new Point(
    points.button1Right.x + points.button1Right.dx(points.hips) * options.pocketPlacementHorizontal,
    points.button1Right.y + points.button1Right.dy(points.button3Right) * options.pocketPlacementVertical
  );
  let pocketWidth = points.button1Right.dx(points.hips) * options.pocketWidth;
  let pocketHeight = pocketWidth * (1 + options.pocketHeight);
  points.pocketTopRight = points.pocketTopLeft.shift(0, pocketWidth);
  points.pocketBottomLeft = points.pocketTopLeft.shift(-90, pocketHeight);
  points.pocketBottomRight = points.pocketTopRight.shift(-90, pocketHeight);
  if (options.pocketRadius > 0) {
    let radius = pocketWidth * options.pocketRadius;
    macro("round", {
      from: points.pocketTopLeft,
      to: points.pocketBottomRight,
      via: points.pocketBottomLeft,
      prefix: "pocketRoundLeft",
      radius
    });
    macro("round", {
      from: points.pocketBottomLeft,
      to: points.pocketTopRight,
      via: points.pocketBottomRight,
      prefix: "pocketRoundRight",
      radius
    });
    store.set("pocketRadius", radius);
  }
  store.set("pocketWidth", pocketWidth);
  store.set("pocketHeight", pocketHeight);

  // Pocket flap
  points.pocketFlapMid = points.pocketTopLeft.shift(0, pocketWidth/2);
  let pocketFlapHeight = pocketHeight * 0.3;
  store.set("pocketFlapHeight", pocketFlapHeight);
  points.pocketFlapTopLeft = new Point(
    points.pocketTopLeft.x - pocketWidth * 0.005,
    points.pocketTopLeft.y - pocketFlapHeight / 4
  );
  points.pocketFlapBottomLeft = new Point(
    points.pocketFlapTopLeft.x,
    points.pocketTopLeft.y + pocketFlapHeight * 0.75
  );
  points.pocketFlapTopRight = points.pocketFlapTopLeft.flipX(points.pocketFlapMid);
  points.pocketFlapBottomRight = points.pocketFlapBottomLeft.flipX(points.pocketFlapMid);
  if (options.pocketFlapRadius > 0) {
    let radius = pocketWidth * options.pocketFlapRadius;
    macro("round", {
      from: points.pocketFlapTopLeft,
      to: points.pocketFlapBottomRight,
      via: points.pocketFlapBottomLeft,
      prefix: "pocketFlapRoundLeft",
      radius,
    });
    macro("round", {
      from: points.pocketFlapBottomLeft,
      to: points.pocketFlapTopRight,
      via: points.pocketFlapBottomRight,
      prefix: "pocketFlapRoundRight",
      radius,
    });
    store.set("pocketFlapRadius", radius);
  }

  // Chest pocket
  points.chestPocketAnchor = new Point(
    points.waist.x * options.chestPocketPlacement,
    points.button2Right.shiftFractionTowards(points.button3Right, 0.2).y
  );
  let chestPocketHeight = points.armhole.dy(points.chestPocketAnchor) * options.chestPocketHeight;
  let chestPocketWidth = chestPocketHeight * options.chestPocketWidth;
  store.set("chestPocketHeight", chestPocketHeight);
  store.set("chestPocketWidth", chestPocketWidth);
  points.chestPocketBottomLeft = points.chestPocketAnchor.shift(180, chestPocketWidth / 2);
  points.chestPocketTopLeft = points.chestPocketBottomLeft.shift(90, chestPocketHeight);
  points.chestPocketBottomRight = points.chestPocketBottomLeft.flipX(points.chestPocketAnchor);
  points.chestPocketTopRight = points.chestPocketTopLeft.flipX(points.chestPocketAnchor);
  for (let i of [
    "chestPocketTopLeft",
    "chestPocketBottomLeft",
    "chestPocketTopRight",
    "chestPocketBottomRight"]) points[i] = points[i].rotate(options.chestPocketAngle, points.chestPocketAnchor);
  store.set("chestPocketBagDepth", points.button3Left.dx(points.chestPocketBottomLeft));

  // Inner pocket
  points.innerPocketAnchor = new Point(
    points.waist.x * options.innerPocketPlacement,
    points.button2Right.shiftFractionTowards(points.button3Right, 1.5).y
  );
  let innerPocketWidth = points.waist.x * options.innerPocketWidth;
  let weltHeight = innerPocketWidth * options.innerPocketWeltHeight;
  store.set("innerPocketWeltHeight", weltHeight);
  store.set("innerPocketWidth", innerPocketWidth);
  points.innerPocketTop = points.innerPocketAnchor.shift(90, weltHeight);
  points.innerPocketBottom = points.innerPocketAnchor.shift(-90, weltHeight);
  points.innerPocketLeft = points.innerPocketAnchor.shift(180, innerPocketWidth/2);
  points.innerPocketRight = points.innerPocketLeft.flipX(points.innerPocketAnchor);
  points.innerPocketTopLeft = points.innerPocketLeft.shift(90, weltHeight);
  points.innerPocketTopRight = points.innerPocketTopLeft.flipX(points.innerPocketAnchor);
  points.innerPocketBottomLeft = points.innerPocketLeft.shift(-90, weltHeight);
  points.innerPocketBottomRight = points.innerPocketBottomLeft.flipX(points.innerPocketAnchor);

  // Roll line
  points.rollLineEdge = points.shoulder.shiftFractionTowards(points.neck, 1.15);
  points.rollLineStart = new Point(
    points.collarEdge.x,
    points.button3Left.y
  );
  points.rollLineEnd = utils.lineIntersectsCurve(
    points.rollLineStart,
    points.rollLineEdge,
    points.cfNeck,
    points.cfNeckCp1,
    points.neckCp2Front,
    points.neck
  );

  // Facing/Lining border (flb)
  points.flbX =  points.button1Right.shift(0, points.button1Right.dx(points.pocketTopLeft)/2);
  points.flbHem = new Point(points.flbX.x, points.hemEdge.y);
  if (points.flbHem.x <= points.cfNeck.x)
    points.flbTop = new Point(points.flbX.x, points.cfNeck.y);
  else if (points.flbHem.x < points.neck.x)
    points.flbTop = utils.lineIntersectsCurve(
      points.flbHem,
      points.flbX.shift(90,points.flbHem.y * 2),
      points.cfNeck,
      points.cfNeckCp1,
      points.neckCp2Front,
      points.neck
    );
  else if (points.flbHem.x < points.shoulder.x)
    points.flbTop = utils.beamsIntersect(
      points.flbHem,
      points.flbX,
      points.neck,
      points.shoulder
    );
  else throw new Error("Could not find intersection of facing/lining boundary with neckline");

  // Store collar length
  store.set(
    "frontCollarLength",
    new Path()
      .move(points.cfNeck)
      .curve(points.cfNeckCp1, points.neckCp2Front, points.neck)
      .length()
  );

  // Clean up
  for (let i in paths) delete paths[i]
  for (let i in snippets) delete snippets[i]

  // Paths
  paths.saBase = new Path()
    .move(points.hem)
    .line(points.seat)
    .curve(points.seatCp2, points.waistCp1, points.waist)
    .curve_(points.waistCp2, points.armhole)
    .curve(points.armholeCp2, points.armholeHollowCp1, points.armholeHollow)
    .curve(points.armholeHollowCp2, points.armholePitchCp1, points.armholePitch)
    .curve(points.armholePitchCp2, points.shoulderCp1, points.shoulder)
    .line(points.neck)
    .curve(points.neckCp2Front, points.cfNeckCp1, points.cfNeck)
    .line(points.collarTip)
    ._curve(points.lapelStraightEndCp1, points.lapelStraightEnd)
    .line(points.hemEdge)
    .line(points.flbHem);
  paths.hemBase = new Path()
    .move(points.flbHem)
    .line(points.hem);
  paths.saBase.render = false;
  paths.hemBase.render = false;
  paths.seam = paths.saBase
    .join(paths.hemBase)
    .close()
    .attr("class", "fabric");

  paths.rollLine = new Path()
    .move(points.rollLineStart)
    .line(points.rollLineEnd)
    .attr("class", "lashed");

  paths.chestPiece = new Path()
    .move(points.rollLineStart)
    .curve(points.button3Right, points.waistCp2, points.armhole)
    .attr("class", "canvas lashed");

  paths.flb = new Path()
    .move(points.flbHem)
    .line(points.flbTop)
    .attr("class", "lining lashed");

  paths.pocket = new Path().move(points.pocketTopLeft);
  if (options.pocketRadius > 0) {
    paths.pocket = paths.pocket
      .line(points.pocketRoundLeftStart)
      .curve(points.pocketRoundLeftCp1, points.pocketRoundLeftCp2, points.pocketRoundLeftEnd)
      .line(points.pocketRoundRightStart)
      .curve(points.pocketRoundRightCp1, points.pocketRoundRightCp2, points.pocketRoundRightEnd)
  } else {
    paths.pocket = paths.pocket
      .line(points.pocketBottomLeft)
      .line(points.pocketBottomRight)
  }
  paths.pocket = paths.pocket
    .line(points.pocketTopRight)
    .line(points.pocketTopLeft)
    .close()
    .attr("class", "fabric help");

  paths.pocketFlap = new Path().move(points.pocketFlapTopLeft);
  if (options.pocketFlapRadius > 0) {
    paths.pocketFlap = paths.pocketFlap
      .line(points.pocketFlapRoundLeftStart)
      .curve(points.pocketFlapRoundLeftCp1, points.pocketFlapRoundLeftCp2, points.pocketFlapRoundLeftEnd)
      .line(points.pocketFlapRoundRightStart)
      .curve(points.pocketFlapRoundRightCp1, points.pocketFlapRoundRightCp2, points.pocketFlapRoundRightEnd)
  } else {
    paths.pocketFlap = paths.pocketFlap
      .line(points.pocketFlapBottomLeft)
      .line(points.pocketFlapBottomRight);
  }
  paths.pocketFlap = paths.pocketFlap
    .line(points.pocketFlapTopRight)
    .line(points.pocketFlapTopLeft)
    .close()
    .attr("class", "fabric help");

  paths.chestPocket = new Path()
    .move(points.chestPocketTopLeft)
    .line(points.chestPocketBottomLeft)
    .line(points.chestPocketBottomRight)
    .line(points.chestPocketTopRight)
    .line(points.chestPocketTopLeft)
    .close()
    .attr("class", "fabric help");

  paths.innerPocket = new Path()
    .move(points.innerPocketTopLeft)
    .line(points.innerPocketBottomLeft)
    .line(points.innerPocketBottomRight)
    .line(points.innerPocketTopRight)
    .line(points.innerPocketTopLeft)
    .close()
    .attr("class", "fabric help");

  if (complete) {
    snippets.button1Left = new Snippet("button", points.button1Left).attr("data-scale", 2);
    snippets.button1Right = new Snippet("button", points.button1Right).attr("data-scale", 2);
    snippets.button2Left = new Snippet("button", points.button2Left).attr("data-scale", 2);
    snippets.button2Right = new Snippet("button", points.button2Right).attr("data-scale", 2);
    snippets.button3Left = new Snippet("button", points.button3Left).attr("data-scale", 2);
    snippets.button3Right = new Snippet("button", points.button3Right).attr("data-scale", 2);

    macro("sprinkle", {
      snippet: "notch",
      on: [
        "armholePitch",
        "cfNeck",
        "rollLineStart",
        "waist",
        "seat"
      ]
    });

    points.logo = new Point(
      points.chestPocketTopRight.x,
      points.armhole.y
    );
    snippets.logo = new Snippet("logo", points.logo);

    macro("grainline", {
      from: points.cfHem,
      to: points.cfNeck
    });

    if (sa) {
      paths.sa = paths.saBase
        .offset(sa)
        .join(paths.hemBase.offset(sa*3))
        .close()
        .attr("class", "fabric sa");
    }

    if (paperless) {
      macro("ld", {
        from: points.hemEdge,
        to: points.flbHem,
        d: 15
      });
      macro("ld", {
        from: points.flbHem,
        to: points.hem,
        d: 15
      });
      macro("hd", {
        from: points.hemEdge,
        to: points.hem,
        y: points.hem.y + 15 + 3*sa
      });
      macro("hd", {
        from: points.rollLineStart,
        to: points.pocketTopLeft,
        y: points.pocketFlapBottomLeft.y
      });
      macro("vd", {
        from: points.pocketFlapTopRight,
        to: points.waist,
        x: points.pocketTopRight.x - 15
      });
      macro("vd", {
        from: points.pocketTopRight,
        to: points.waist,
        x: points.pocketTopRight.x - 30
      });
      macro("vd", {
        from: points.chestPocketBottomLeft,
        to: points.waist,
        x: points.chestPocketBottomLeft.x - 15
      });
      macro("hd", {
        from: points.rollLineStart,
        to: points.chestPocketBottomLeft,
        y: points.chestPocketBottomLeft.y + 15
      });
      macro("hd", {
        from: points.rollLineStart,
        to: points.button3Left,
        y: points.button3Left.y + 15
      });
      macro("hd", {
        from: points.button3Left,
        to: points.button3Right,
        y: points.button3Left.y + 15
      });
      macro("vd", {
        from: points.hem,
        to: points.seat,
        x: points.hem.x + sa + 15
      });
      macro("vd", {
        from: points.hem,
        to: points.waist,
        x: points.hem.x + sa + 30
      });
      macro("vd", {
        from: points.hem,
        to: points.armhole,
        x: points.hem.x + sa + 45
      });
      macro("vd", {
        from: points.armhole,
        to: points.armholePitch,
        x: points.armhole.x + sa + 15
      });
      macro("vd", {
        from: points.armhole,
        to: points.shoulder,
        x: points.armhole.x + sa + 30
      });
      macro("vd", {
        from: points.armhole,
        to: points.neck,
        x: points.armhole.x + sa + 45
      });
      macro("vd", {
        from: points.rollLineStart,
        to: points.collarTip,
        x: points.rollLineStart.x - sa - 15
      });
      macro("vd", {
        from: points.button2Left,
        to: points.rollLineStart,
        x: points.rollLineStart.x - sa - 15
      });
      macro("vd", {
        from: points.button1Left,
        to: points.button2Left,
        x: points.rollLineStart.x - sa - 15
      });
      macro("vd", {
        from: points.hemEdge,
        to: points.collarTip,
        x: points.rollLineStart.x - sa - 30
      });
      macro("vd", {
        from: points.hemEdge,
        to: points.neck,
        x: points.rollLineStart.x - sa - 45
      });
      macro("hd", {
        from: points.lapelStraightEnd,
        to: points.collarTip,
        y: points.collarTip.y - sa - 15
      });
      macro("hd", {
        from: points.lapelStraightEnd,
        to: points.cfNeck,
        y: points.collarTip.y - sa - 30
      });
      macro("hd", {
        from: points.lapelStraightEnd,
        to: points.rollLineEnd,
        y: points.collarTip.y - sa - 45
      });
      macro("hd", {
        from: points.lapelStraightEnd,
        to: points.neck,
        y: points.neck.y - sa - 15
      });
      macro("hd", {
        from: points.lapelStraightEnd,
        to: points.armholePitch,
        y: points.neck.y - sa - 30
      });
      macro("hd", {
        from: points.lapelStraightEnd,
        to: points.shoulder,
        y: points.neck.y - sa - 45
      });
      macro("hd", {
        from: points.lapelStraightEnd,
        to: points.armhole,
        y: points.neck.y - sa - 60
      });
    }
  }


  return part;
}