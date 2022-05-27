import { WebSocketServer } from 'ws'
import { v4 } from 'uuid'

const matches = []
const playersWaitingForMatch = []

const onError = (ws, error) => {
  console.error(`Error: ${error.message}`)
}

const emptySpace = ({ x, y, board, verfiedsCoordenates }) => {
  if (verfiedsCoordenates.includes(`${x}${y}`)) {
    return true
  }
  verfiedsCoordenates.push(`${x}${y}`)
  if (x > 9 || y > 9 || x < 0 || y < 0) {
    return true
  }
  if (board[x][y] === 'S') {
    return (
      emptySpace({ x, y: y + 1, board, verfiedsCoordenates }) &&
      emptySpace({ x, y: y - 1, board, verfiedsCoordenates })
    )
  }
  return (
    board[x][y] === '' ||
    board[x][y] === undefined ||
    board[x][y] === 'S' ||
    board[x][y] === 'W'
  )
}

const verifyAllShipDestruction = ({ x, y, board }) => {
  const verfiedsCoordenates = []
  return emptySpace({ x, y, board, verfiedsCoordenates })
}

const checkWin = (board) => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (
        !(board[i][j] == 'W') &&
        !(board[i][j] == 'S') &&
        !(board[i][j] == '')
      ) {
        return false
      }
    }
  }
  return true
}

const onMessage = (ws, data) => {
  const dataJSON = JSON.parse(data)
  if (dataJSON.type == 'attack') {
    const match = matches.find((match) => match.id == dataJSON.data.match_id)
    const player =
      match.player1.id == dataJSON.data.id ? match.player1 : match.player2
    const opponent =
      match.player1.id == dataJSON.data.id ? match.player2 : match.player1

    if (opponent.board[dataJSON.data.x][dataJSON.data.y] == '') {
      opponent.board[dataJSON.data.x][dataJSON.data.y] = 'W'
      ws.send(
        JSON.stringify({
          type: 'match',
          data: {
            status: 'opponent turn',
            x: dataJSON.data.x,
            y: dataJSON.data.y,
            target: 'W',
          },
        })
      )
      opponent.ws.send(
        JSON.stringify({
          type: 'match',
          data: {
            status: 'my turn',
            x: dataJSON.data.x,
            y: dataJSON.data.y,
            target: 'W',
          },
        })
      )
    } else {
      opponent.board[dataJSON.data.x][dataJSON.data.y] = 'S'
      if (checkWin(opponent.board)) {
        ws.send(
          JSON.stringify({
            type: 'match',
            data: {
              status: 'win',
            },
          })
        )

        opponent.ws.send(
          JSON.stringify({
            type: 'match',
            data: {
              status: 'lose',
            },
          })
        )

        matches.splice(matches.indexOf(match), 1)
        return
      }

      if (
        verifyAllShipDestruction({
          x: dataJSON.data.x,
          y: dataJSON.data.y,
          board: opponent.board,
        })
      ) {
        ws.send(
          JSON.stringify({
            type: 'match',
            data: {
              status: 'my turn',
              x: dataJSON.data.x,
              y: dataJSON.data.y,
              target: 'S',
              message: 'ship down',
            },
          })
        )
        opponent.ws.send(
          JSON.stringify({
            type: 'match',
            data: {
              status: 'opponent turn',
              x: dataJSON.data.x,
              y: dataJSON.data.y,
              target: 'S',
            },
          })
        )

        return
      }

      ws.send(
        JSON.stringify({
          type: 'match',
          data: {
            status: 'my turn',
            x: dataJSON.data.x,
            y: dataJSON.data.y,
            target: 'S',
          },
        })
      )
      opponent.ws.send(
        JSON.stringify({
          type: 'match',
          data: {
            status: 'opponent turn',
            x: dataJSON.data.x,
            y: dataJSON.data.y,
            target: 'S',
          },
        })
      )
    }
  } else if (dataJSON.type == 'ready') {
    const match = matches.find((match) => match.id == dataJSON.data.match_id)
    const player =
      match.player1.id == dataJSON.data.id ? match.player1 : match.player2
    const opponent =
      match.player1.id == dataJSON.data.id ? match.player2 : match.player1
    player.ready = true
    player.board = dataJSON.data.board
    if (opponent.ready) {
      opponent.ws.send(
        JSON.stringify({
          type: 'match',
          data: {
            status: 'my turn',
            board: player.board,
          },
        })
      )
      ws.send(
        JSON.stringify({
          type: 'match',
          data: {
            status: 'opponent turn',
            board: opponent.board,
          },
        })
      )
    } else {
      ws.send(
        JSON.stringify({
          type: 'match',
          data: { status: 'waiting opponent' },
        })
      )

      opponent.ws.send(
        JSON.stringify({
          type: 'match',
          data: { status: 'opponent ready' },
        })
      )
    }
  } else if (dataJSON.type == 'findMatch') {
    if (playersWaitingForMatch.length > 0) {
      const {
        data: { nick },
      } = JSON.parse(data)

      const id = v4()

      const {
        ws: ws_player1,
        nick: player1_nick,
        id: player1_id,
      } = playersWaitingForMatch.pop()

      const player1 = {
        ws: ws_player1,
        nick: player1_nick,
        id: player1_id,
      }

      const player2 = {
        id,
        ws,
        nick,
      }

      const match_id = v4()

      player1.ws.send(
        JSON.stringify({
          type: 'match',
          data: {
            opponent_nick: player2.nick,
            match_id,
            status: 'match created',
          },
        })
      )
      player2.ws.send(
        JSON.stringify({
          type: 'match',
          data: {
            opponent_nick: player1.nick,
            id,
            match_id,
            status: 'match created',
          },
        })
      )

      matches.push({
        id: match_id,
        player1,
        player2,
      })

      //
      return
    }
    const {
      data: { nick },
    } = JSON.parse(data)
    const id = v4()
    playersWaitingForMatch.push({ id, ws, nick })
    ws.send(
      JSON.stringify({ type: 'match', data: { id, status: 'waiting match' } })
    )
  }
}

const onClose = (ws) => {
  playersWaitingForMatch.forEach((player) => {
    if (player.ws == ws) {
      playersWaitingForMatch.splice(playersWaitingForMatch.indexOf(player), 1)
    }
  })
  matches.forEach((match) => {
    if (match.player1.ws == ws) {
      match.player2.ws.send(
        JSON.stringify({
          type: 'match',
          data: { status: 'opponent disconnected' },
        })
      )
      matches.splice(matches.indexOf(match), 1)
    } else if (match.player2.ws == ws) {
      match.player1.ws.send(
        JSON.stringify({
          type: 'match',
          data: { status: 'opponent disconnected' },
        })
      )
      matches.splice(matches.indexOf(match), 1)
    }
  })
}

const onConnection = (ws, req) => {
  ws.on('error', (error) => onError(ws, error))
  ws.on('message', (data) => onMessage(ws, data))
  ws.on('close', () => onClose(ws))
  ws.send(
    JSON.stringify({
      type: 'connection',
      data: 'connected',
    })
  )
}

export default (server) => {
  const wss = new WebSocketServer({ server })
  wss.on('connection', onConnection)

  return wss
}

