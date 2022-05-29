const ws_protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'

const ws = new WebSocket(ws_protocol + location.host)
let nick = 'Anonymous Player'
let id = ''
let match_id
const my_board = [
  ['', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', ''],
]

let game_state = ''

const PA_TOTAL = 1
const EC_TOTAL = 2
const HA_TOTAL = 3
const SB_TOTAL = 4
const CR_TOTAL = 3
let PA = 0
let EC = 0
let HA = 0
let SB = 0
let CR = 0
let horizontal = true
let lastX
let lastY

const joinLobby = () => {
  nick = document.getElementById('nick').value
    ? document.getElementById('nick').value
    : 'Anonymous Player'
  document.getElementById('nick').value = ''
  ws.send(
    JSON.stringify({
      type: 'findMatch',
      data: {
        nick,
      },
    })
  )
}

const ready = () => {
  ws.send(
    JSON.stringify({
      type: 'ready',
      data: {
        id,
        match_id,
        board: my_board,
      },
    })
  )
}

const attack = (x, y) => {
  if (game_state == 'my turn') {
    game_state = 'opponent turn'
    ws.send(
      JSON.stringify({
        type: 'attack',
        data: {
          id,
          match_id,
          x,
          y,
        },
      })
    )
  }
}

const emptySpace = ({ x, y }) => {
  if (x > 9 || y > 9 || x < 0 || y < 0) {
    return true
  }
  return my_board[x][y] === '' || my_board[x][y] === undefined
}

const verifyEmptySpaceBetween = (ships) => {
  let emptySpaceBetween = true
  ships.forEach(({ x, y }) => {
    if (
      !emptySpace({ x, y }) ||
      !emptySpace({ x: x + 1, y }) ||
      !emptySpace({ x: x - 1, y }) ||
      !emptySpace({ x, y: y + 1 }) ||
      !emptySpace({ x, y: y - 1 }) ||
      !emptySpace({ x: x + 1, y: y + 1 }) ||
      !emptySpace({ x: x - 1, y: y - 1 }) ||
      !emptySpace({ x: x + 1, y: y - 1 }) ||
      !emptySpace({ x: x - 1, y: y + 1 })
    ) {
      emptySpaceBetween = false
      return
    }
  })
  return emptySpaceBetween
}

const verifyEmptySpace = (ships) => {
  let emptySpace = true
  ships.forEach(({ x, y }) => {
    if (!emptySpace({ x, y })) {
      emptySpace = false
      return
    }
  })
  return emptySpace
}

const add = (x, y) => {
  if (PA < PA_TOTAL) {
    if (horizontal) {
      if (
        y > 7 ||
        y < 2 ||
        !verifyEmptySpaceBetween([
          { x, y },
          { x, y: y - 2 },
          { x, y: y - 1 },
          { x, y: y + 1 },
          { x, y: y + 2 },
        ])
      ) {
        alert('Local invalido')
        return
      }
      PA++
      my_board[x][y - 2] = 'PA'
      my_board[x][y - 1] = 'PA'
      my_board[x][y] = 'PA'
      my_board[x][y + 1] = 'PA'
      my_board[x][y + 2] = 'PA'

      document.getElementById(`${x}${y - 2}`).style.background = 'yellow'
      document.getElementById(`${x}${y - 1}`).style.background = 'yellow'
      document.getElementById(`${x}${y}`).style.background = 'yellow'
      document.getElementById(`${x}${y + 1}`).style.background = 'yellow'
      document.getElementById(`${x}${y + 2}`).style.background = 'yellow'
    } else {
      if (
        x > 7 ||
        x < 2 ||
        !verifyEmptySpaceBetween([
          { x, y },
          { x: x - 2, y },
          { x: x - 1, y },
          { x: x + 1, y },
          { x: x + 2, y },
        ])
      ) {
        alert('Local invalido')
        return
      }
      PA++
      my_board[x - 2][y] = 'PA'
      my_board[x - 1][y] = 'PA'
      my_board[x][y] = 'PA'
      my_board[x + 1][y] = 'PA'
      my_board[x + 2][y] = 'PA'

      document.getElementById(`${x - 2}${y}`).style.background = 'yellow'
      document.getElementById(`${x - 1}${y}`).style.background = 'yellow'
      document.getElementById(`${x}${y}`).style.background = 'yellow'
      document.getElementById(`${x + 1}${y}`).style.background = 'yellow'
      document.getElementById(`${x + 2}${y}`).style.background = 'yellow'
    }

    if (PA == PA_TOTAL) {
      document.getElementById('peca').innerHTML = 'Encouraçado'
    }
  } else if (EC < EC_TOTAL) {
    if (horizontal) {
      if (
        y > 7 ||
        y < 1 ||
        !verifyEmptySpaceBetween([
          { x, y },
          { x, y: y - 1 },
          { x, y: y + 1 },
          { x, y: y + 2 },
        ])
      ) {
        alert('Local invalido')
        return
      }
      EC++
      my_board[x][y - 1] = 'EC'
      my_board[x][y] = 'EC'
      my_board[x][y + 1] = 'EC'
      my_board[x][y + 2] = 'EC'

      document.getElementById(`${x}${y - 1}`).style.background = 'red'
      document.getElementById(`${x}${y}`).style.background = 'red'
      document.getElementById(`${x}${y + 1}`).style.background = 'red'
      document.getElementById(`${x}${y + 2}`).style.background = 'red'
    } else {
      if (
        x > 7 ||
        x < 1 ||
        !verifyEmptySpaceBetween([
          { x, y },
          { x: x - 1, y },
          { x: x + 1, y },
          { x: x + 2, y },
        ])
      ) {
        alert('Local invalido')
        return
      }
      EC++
      my_board[x - 1][y] = 'EC'
      my_board[x][y] = 'EC'
      my_board[x + 1][y] = 'EC'
      my_board[x + 2][y] = 'EC'

      document.getElementById(`${x - 1}${y}`).style.background = 'red'
      document.getElementById(`${x}${y}`).style.background = 'red'
      document.getElementById(`${x + 1}${y}`).style.background = 'red'
      document.getElementById(`${x + 2}${y}`).style.background = 'red'
    }

    if (EC == EC_TOTAL) {
      document.getElementById('peca').innerHTML = 'Submarino'
    }
  } else if (SB < SB_TOTAL) {
    if (!verifyEmptySpaceBetween([{ x, y }])) {
      alert('Local invalido')
      return
    }
    SB++

    my_board[x][y] = 'SB'

    document.getElementById(`${x}${y}`).style.background = 'green'

    if (SB == SB_TOTAL) {
      document.getElementById('peca').innerHTML = 'Cruzador'
    }
  } else if (CR < CR_TOTAL) {
    if (horizontal) {
      if (
        y > 8 ||
        !verifyEmptySpaceBetween([
          { x, y },
          { x, y: y + 1 },
        ])
      ) {
        alert('Local invalido')
        return
      }
      CR++

      my_board[x][y] = 'CR'
      my_board[x][y + 1] = 'CR'

      document.getElementById(`${x}${y}`).style.background = 'orange'
      document.getElementById(`${x}${y + 1}`).style.background = 'orange'
    } else {
      if (
        x > 8 ||
        !verifyEmptySpaceBetween([
          { x, y },
          { x: x + 1, y },
        ])
      ) {
        alert('Local invalido')
        return
      }
      CR++

      my_board[x][y] = 'CR'
      my_board[x + 1][y] = 'CR'

      document.getElementById(`${x}${y}`).style.background = 'orange'
      document.getElementById(`${x + 1}${y}`).style.background = 'orange'
    }

    if (CR == CR_TOTAL) {
      ready()
    }
  } else {
    console.log('pronto')
  }
}

ws.onclose = () => {
  document.getElementById('messageArea').innerHTML =
    'O servidor caiu, sentimos muito :('
  document.getElementById('messageArea2').innerHTML = ''
  document.getElementById('macth-phase-1').style.display = 'block'
  document.getElementById('menu').style.display = 'none'
  document.getElementById('opponent-board').style.display = 'none'
  document.getElementById('my-board').style.display = 'none'
  console.log('hello')
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.type == 'match') {
    if (data.data.status === 'waiting match') {
      document.getElementById('menu').style.display = 'none'
      document.getElementById('waiting').style.display = 'block'
      id = data.data.id
    }
    if (data.data.status === 'match created') {
      document.getElementById('menu').style.display = 'none'
      document.getElementById('waiting').style.display = 'none'
      document.getElementById('macth-phase-1').style.display = 'block'
      document.getElementById('opponent').innerHTML = data.data.opponent_nick
      id = id ? id : data.data.id
      match_id = data.data.match_id
    }
    if (data.data.status === 'waiting opponent') {
      document.getElementById('messageArea').innerHTML =
        'Aguardando oponente...'
    }
    if (data.data.status === 'opponent ready') {
      document.getElementById('messageArea2').innerHTML = 'Oponente pronto!'
    }
    if (data.data.status === 'win') {
      document.getElementById('messageArea').innerHTML =
        'Parabens, você venceu!!!!'
      document.getElementById('messageArea').style.color = 'green'
      document.getElementById('opponent-board').style.display = 'none'
      document.getElementById('my-board').style.display = 'none'
    }
    if (data.data.status === 'lose') {
      document.getElementById('messageArea').innerHTML =
        'Que pena, você perdeu!'
      document.getElementById('messageArea').style.color = 'red'
      document.getElementById('opponent-board').style.display = 'none'
      document.getElementById('my-board').style.display = 'none'
    }
    if (data.data.status === 'my turn') {
      document.getElementById('messageArea').innerHTML = 'Sua vez!'
      document.getElementById('messageArea2').innerHTML = ''
      document.getElementById('opponent-board').style.display = 'block'
      game_state = 'my turn'

      if (data.data.message === 'ship down') {
        document.getElementById('messageArea2').innerHTML =
          'Você derrubou um navio!'
      }
      if (data.data.target) {
        if (data.data.target === 'W') {
          document.getElementById(
            `${data.data.x}${data.data.y}`
          ).style.background = 'blue'
          my_board[data.data.x][data.data.y] = 'W'
        } else {
          document.getElementById(
            `opponent-${data.data.x}${data.data.y}`
          ).style.background = 'brown'
        }
      }
    }
    if (data.data.status === 'opponent turn') {
      document.getElementById('messageArea').innerHTML = 'Vez do seu oponente!'
      document.getElementById('messageArea2').innerHTML = ''
      document.getElementById('opponent-board').style.display = 'block'
      game_state = 'opponent turn'

      if (data.data.target) {
        if (data.data.target === 'W') {
          document.getElementById(
            `opponent-${data.data.x}${data.data.y}`
          ).style.background = 'blue'
        } else {
          document.getElementById(
            `${data.data.x}${data.data.y}`
          ).style.background = 'brown'
        }
      }
    }
    if (data.data.status === 'opponent disconnected') {
      document.getElementById('messageArea').innerHTML =
        'O seu oponente saiu! A partida acabou :('
      document.getElementById('messageArea2').innerHTML = ''
      document.getElementById('opponent-board').style.display = 'none'
      document.getElementById('my-board').style.display = 'none'
    }
  }
}

const preview = (x, y) => {
  lastX = x
  lastY = y
  if (PA < PA_TOTAL) {
    if (horizontal) {
      if (
        y > 7 ||
        y < 2 ||
        !verifyEmptySpaceBetween([
          { x, y },
          { x, y: y - 2 },
          { x, y: y - 1 },
          { x, y: y + 1 },
          { x, y: y + 2 },
        ])
      ) {
        return
      }

      document.getElementById(`${x}${y - 2}`).style.background = '#538daa'
      document.getElementById(`${x}${y - 1}`).style.background = '#538daa'
      document.getElementById(`${x}${y}`).style.background = '#538daa'
      document.getElementById(`${x}${y + 1}`).style.background = '#538daa'
      document.getElementById(`${x}${y + 2}`).style.background = '#538daa'
    } else {
      if (
        x > 7 ||
        x < 2 ||
        !verifyEmptySpaceBetween([
          { x, y },
          { x: x - 2, y },
          { x: x - 1, y },
          { x: x + 1, y },
          { x: x + 2, y },
        ])
      ) {
        return
      }

      document.getElementById(`${x - 2}${y}`).style.background = '#538daa'
      document.getElementById(`${x - 1}${y}`).style.background = '#538daa'
      document.getElementById(`${x}${y}`).style.background = '#538daa'
      document.getElementById(`${x + 1}${y}`).style.background = '#538daa'
      document.getElementById(`${x + 2}${y}`).style.background = '#538daa'
    }
  } else if (EC < EC_TOTAL) {
    if (horizontal) {
      if (
        y > 7 ||
        y < 1 ||
        !verifyEmptySpaceBetween([
          { x, y },
          { x, y: y - 1 },
          { x, y: y + 1 },
          { x, y: y + 2 },
        ])
      ) {
        return
      }

      document.getElementById(`${x}${y - 1}`).style.background = '#538daa'
      document.getElementById(`${x}${y}`).style.background = '#538daa'
      document.getElementById(`${x}${y + 1}`).style.background = '#538daa'
      document.getElementById(`${x}${y + 2}`).style.background = '#538daa'
    } else {
      if (
        x > 7 ||
        x < 1 ||
        !verifyEmptySpaceBetween([
          { x, y },
          { x: x - 1, y },
          { x: x + 1, y },
          { x: x + 2, y },
        ])
      ) {
        return
      }

      document.getElementById(`${x - 1}${y}`).style.background = '#538daa'
      document.getElementById(`${x}${y}`).style.background = '#538daa'
      document.getElementById(`${x + 1}${y}`).style.background = '#538daa'
      document.getElementById(`${x + 2}${y}`).style.background = '#538daa'
    }
  } else if (SB < SB_TOTAL) {
    if (!verifyEmptySpaceBetween([{ x, y }])) {
      return
    }

    document.getElementById(`${x}${y}`).style.background = '#538daa'
  } else if (CR < CR_TOTAL) {
    if (horizontal) {
      if (
        y > 8 ||
        !verifyEmptySpaceBetween([
          { x, y },
          { x, y: y + 1 },
        ])
      ) {
        return
      }

      document.getElementById(`${x}${y}`).style.background = '#538daa'
      document.getElementById(`${x}${y + 1}`).style.background = '#538daa'
    } else {
      if (
        x > 8 ||
        !verifyEmptySpaceBetween([
          { x, y },
          { x: x + 1, y },
        ])
      ) {
        return
      }

      document.getElementById(`${x}${y}`).style.background = '#538daa'
      document.getElementById(`${x + 1}${y}`).style.background = '#538daa'
    }
  }
}

const removePreview = (x, y) => {
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if (my_board[i][j] === '') {
        document.getElementById(`${i}${j}`).style.background = 'transparent'
      }
    }
  }
}

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    horizontal = !horizontal
    if (!isNaN(lastX) && !isNaN(lastY)) {
      removePreview(lastX, lastY)
      preview(lastX, lastY)
    }
  }
})

