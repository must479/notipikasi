## Push Notifications for Web3 Dapps

This is a simple example of how to use push notifications in a web3 dapp. It uses the [Push Protocol](https://push.org/) to receive push notifications(both persisted and real-time) from another dapp or channel.

**This project is the fork of uniswap's interface to demonstrate how to integrate push notifications in a web3 dapp.**

#### Packages used

1. @pushprotocol/restapi - opt-in to channels, send and receive notifications to the user's Dapp

2. @pushprotocol/uiweb - to display the notification in the dapp

3. @pushprotocol/socket - to connect and receive real-time notifications from push's websocket server

#### Customizations did to the original uniswap interface

1. Added a new page to the dapp to display the notifications `src/pages/Notifications/index.tsx`

2. Added a new route to the dapp `src/pages/App.tsx` as `/notifications`

3. Added Navbar Link to the notifications page

#### Getting Persisted notifications:

```javascript
await PushAPI.user.getFeeds({
  user: 'eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681', // user address in CAIP
  env: 'staging', // or 'prod'
  page: 1,
  limit: 10,
  raw: true,
  spam: false,
})
```

#### Getting Real-time notifications:

```javascript
import { createSocketConnection, EVENTS } from '@pushprotocol/socket'

const sdkSocket = createSocketConnection({
  user: `eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681`, // user address in CAIP
  env: 'staging', // or 'prod'
  socketOptions: { autoConnect: true },
})

sdkSocket.on(EVENTS.USER_FEEDS, (notification) => {
  console.log('received a new notification:', notification)
})
```

#### Filtering notifications by channel:

```javascript
const notifications = await PushAPI.user.getFeeds({
  user: 'eip155:5:0xD8634C39BBFd4033c0d3289C4515275102423681', // user address in CAIP
  env: 'staging', // or 'prod'
  page: 1,
  limit: 10,
  raw: true,
  spam: false,
})

const UNISWAP_CHANNEL_ADDRESS = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
const uniswapNotifications = notifications.filter(({ sender }) => sender === UNISWAP_CHANNEL_ADDRESS)

console.log('uniswap notifications:', uniswapNotifications)
```

### Getting Started

```bash
yarn install
yarn start
```

#### Demo:

https://user-images.githubusercontent.com/29351207/203759666-67a31f1d-5cf8-473a-901c-8eb43c919ebd.mp4

![Screenshot1](https://github.com/Salmandabbakuti/uniswap-interface/blob/main/resources/notifications-screenshot.png)
