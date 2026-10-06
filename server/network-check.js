import net from 'node:net'

export const defaultTargets = [
  { host: 'api.resend.com', port: 443 },
  { host: 'smtp.gmail.com', port: 465 },
  { host: 'smtp.gmail.com', port: 587 },
]

function probe({ host, port }, timeoutMs) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port })
    const finish = (status) => {
      socket.destroy()
      resolve(`${host}:${port} ${status}`)
    }
    socket.setTimeout(timeoutMs, () => finish('TIMED OUT'))
    socket.once('connect', () => finish('open'))
    socket.once('error', (error) => finish(`BLOCKED (${error.code ?? error.message})`))
  })
}

// Reports which outbound connections this host allows, so a firewall that blocks
// SMTP shows up in the server log instead of being guessed at.
export async function checkOutbound(targets = defaultTargets, timeoutMs = 5000) {
  return Promise.all(targets.map((target) => probe(target, timeoutMs)))
}
