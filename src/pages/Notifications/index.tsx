import * as PushAPI from '@pushprotocol/restapi'
import { createSocketConnection, EVENTS } from '@pushprotocol/socket'
import { NotificationItem } from '@pushprotocol/uiweb'
import { useWeb3React } from '@web3-react/core'
import { Avatar, Button, notification, Tabs } from 'antd'
import { useEffect, useState } from 'react'
export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [sdkSocket, setSdkSocket] = useState<any>()

  const { account } = useWeb3React()

  const UNISWAP_CHANNEL_ADDRESS = '0x97E5271f2987c7A3450e21dD7FFe4D004ddE773E' // Uniswap V3 channel address

  useEffect(() => {
    if (account) {
      const sdkSocket = createSocketConnection({
        user: `eip155:5:${account}`, // user address in CAIP
        env: 'prod',
        socketOptions: { autoConnect: true },
      })
      setSdkSocket(sdkSocket)
      addSocketEvents(sdkSocket)
      getNotifications()
      return () => {
        if (sdkSocket) {
          removeSocketEvents(sdkSocket)
          sdkSocket.disconnect()
        }
      }
    }
  }, [account])

  const addSocketEvents = (sdkSocket: any) => {
    sdkSocket?.on(EVENTS.CONNECT, () => {
      console.log('Connected to Push Protocol')
      setIsSocketConnected(true)
    })

    sdkSocket?.on(EVENTS.DISCONNECT, () => {
      console.log('Disconnected from Push Protocol')
      setIsSocketConnected(false)
    })

    sdkSocket?.on(EVENTS.USER_FEEDS, (feedItem: any) => {
      console.log('Received new notification:', feedItem)
      notification.info({
        message: feedItem?.payload?.notification?.title,
        description: feedItem?.payload?.notification?.body,
        duration: 6,
        icon: <Avatar shape="circle" size="large" alt="notification icon" src={feedItem?.payload?.data?.icon} />,
      })
      const {
        payload: { data },
        source,
      } = feedItem
      const newNotification = {
        cta: data.acta,
        app: data.app,
        icon: data.icon,
        title: data.asub,
        message: data.amsg,
        image: data.aimg,
        url: data.url,
        blockchain: source,
      }
      console.log('New notification', newNotification)
      setNotifications((prev) => [feedItem, ...prev])
    })
  }

  const removeSocketEvents = (sdkSocket: any) => {
    sdkSocket?.off(EVENTS.CONNECT)
    sdkSocket?.off(EVENTS.DISCONNECT)
    sdkSocket?.off(EVENTS.USER_FEEDS)
  }

  const toggleConnection = () => {
    if (isSocketConnected) {
      console.log('Disconnecting from Push Protocol')
      sdkSocket.disconnect()
      window.location.reload()
    } else {
      console.log('Connecting to Push Protocol')
      sdkSocket.connect()
    }
  }

  const getNotifications = async () => {
    PushAPI.user
      .getFeeds({
        user: `eip155:5:${account}`, // user address in CAIP
        env: 'prod',
        page: 1,
        limit: 10,
        raw: true,
      })
      .then((feeds: any) => {
        console.log('user notifications: ', feeds)
        setNotifications(feeds)
      })
      .catch((err: any) => {
        console.error('failed to get user notifications: ', err)
      })
  }

  const Inbox = () => {
    return (
      <div>
        <h1>Inbox</h1>
        {notifications.map((oneNotification, id) => {
          const {
            payload: { data },
            source,
          } = oneNotification
          const { app, icon, acta, asub, amsg, aimg, url } = data
          return (
            <NotificationItem
              key={id} // any unique id
              notificationTitle={asub}
              notificationBody={amsg}
              cta={acta}
              app={app}
              icon={icon}
              image={aimg}
              url={url}
              chainName={source}
              isSpam={false}
              theme="light"
            />
          )
        })}
      </div>
    )
  }

  const UniswapNotifications = () => {
    return (
      <div>
        <h1>Uniswap Notifications</h1>
        {notifications
          .filter(({ sender }) => sender === UNISWAP_CHANNEL_ADDRESS)
          .map((oneNotification, id) => {
            const {
              payload: { data },
              source,
            } = oneNotification
            const { app, icon, acta, asub, amsg, aimg, url } = data
            return (
              <NotificationItem
                key={id} // any unique id
                notificationTitle={asub}
                notificationBody={amsg}
                cta={acta}
                app={app}
                icon={icon}
                image={aimg}
                url={url}
                chainName={source}
                isSpam={false}
                theme="light"
              />
            )
          })}
      </div>
    )
  }

  return (
    <div>
      <h1>Notifications</h1>
      <p>Connection Status : {isSocketConnected ? 'Connected' : 'Disconnected'}</p>
      <Button type="primary" onClick={toggleConnection}>
        {isSocketConnected ? 'Disconnect' : 'Connect'}
      </Button>
      <Tabs
        animated
        onChange={getNotifications}
        items={[
          {
            label: 'Inbox',
            key: 'item-1',
            children: <Inbox />,
          },
          {
            label: 'Uniswap',
            key: 'item-2',
            children: <UniswapNotifications />,
          },
        ]}
      />
    </div>
  )
}
