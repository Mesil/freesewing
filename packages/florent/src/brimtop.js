export default function(part) {
  let { paperless, sa, complete, points, macro, paths, Path } = part.shorthand()

  paths.hint = new Path()
    .move(points.tipLeft)
    .curve(points.tipLeftCp2, points.outerMidCp1, points.outerMid)
    .curve(points.outerMidCp2, points.tipRightCp1, points.tipRight)
    .attr('class', 'dashed stroke-sm')

  // We check for sa here because it's a good way to sidestep issue #19
  if (sa) paths.seam = paths.hint.offset(3)
  paths.seam = paths.seam
    .line(points.tipRight)
    .curve(points.tipRightCp2, points.innerMidCp1, points.innerMid)
    .curve(points.innerMidCp2, points.tipLeftCp1, points.tipLeft)
    .line(paths.seam.start())
    .close()
    .attr('class', 'fabric')

  if (complete) {
    points.title = points.innerMid.shiftFractionTowards(points.outerMidCp2, 0.35)
    macro('title', {
      at: points.title,
      nr: 4,
      title: 'brimTop'
    })
    macro('grainline', {
      from: points.outerMid,
      to: points.innerMid
    })

    if (sa) paths.sa = paths.seam.offset(sa).attr('class', 'fabric sa')

    if (paperless) {
      let bottom = paths.seam.edge('bottom')
      macro('hd', {
        from: paths.seam.edge('left'),
        to: paths.seam.edge('right'),
        y: points.tipLeft.y - sa - 15
      })
      macro('vd', {
        from: bottom,
        to: points.innerMid,
        x: points.innerMid.x - 15
      })
      macro('vd', {
        from: bottom,
        to: points.tipRight,
        x: points.tipRight.x + sa + 18
      })
    }
  }

  return part
}
