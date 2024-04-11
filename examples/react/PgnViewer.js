import React, {useLayoutEffect} from 'react'
import Children from 'react-children-utilities'
import * as uuid from 'uuid'
import { pgnView } from '@mliebelt/pgn-viewer'

export function PGNViewer(props) {
  const gameDecription = Children.onlyText(props.children)
  const id = 'board-' + uuid.v4()

  useLayoutEffect(() => {
    pgnView(id,
      {
        pgn: gameDecription,
        timerTime: '1',
        locale: 'pl',
        startPlay: 1,
        showResult: true,
        boardSize: '340',
        showFen: true,
        pieceStyle: 'merida'
      }
    )
  })

  return (
    <div id={id}></div>
  )
}