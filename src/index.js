import app from './app.js'
import lobby from './lobby.js'

const server = app.listen(process.env.PORT || 3000, () =>
  console.log('Server running')
)

lobby(server)

