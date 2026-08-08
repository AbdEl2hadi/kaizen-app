import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface PopupWindowApi {
  open: () => void
  close: () => void
  isOpen: boolean
}

interface PopupWindowProps {
  url: string
  title: string
  width?: number
  height?: number
  expectedOrigin?: string
  onMessage?: (event: MessageEvent) => void
  onClose?: () => void
  children: (popup: PopupWindowApi) => ReactNode
}

const DEFAULT_WIDTH = 520
const DEFAULT_HEIGHT = 640
const CLOSE_POLL_INTERVAL = 500
const CLOSE_CONFIRM_DELAY = 2000

export function PopupWindow({
  url,
  title,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  expectedOrigin,
  onMessage,
  onClose,
  children,
}: PopupWindowProps) {
  const popupRef = useRef<Window | null>(null)
  const receivedMessageRef = useRef(false)
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus()
      return
    }

    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      url,
      title,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
    )

    if (!popup) return
    receivedMessageRef.current = false
    popupRef.current = popup
    setIsOpen(true)
  }, [url, title, width, height])

  const close = useCallback(() => {
    popupRef.current?.close()
    popupRef.current = null
    setIsOpen(false)
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== popupRef.current) return
      if (expectedOrigin && event.origin !== expectedOrigin) return
      receivedMessageRef.current = true
      onMessage?.(event)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onMessage, expectedOrigin])

  useEffect(() => {
    if (!isOpen) return

    const finishClose = () => {
      popupRef.current = null
      setIsOpen(false)
      onClose?.()
    }

    let confirmTimer: number | undefined

    const interval = window.setInterval(() => {
      if (!popupRef.current?.closed) return

      window.clearInterval(interval)
      confirmTimer = window.setTimeout(() => {
        if (receivedMessageRef.current) return
        finishClose()
      }, CLOSE_CONFIRM_DELAY)
    }, CLOSE_POLL_INTERVAL)

    return () => {
      window.clearInterval(interval)
      if (confirmTimer) window.clearTimeout(confirmTimer)
    }
  }, [isOpen, onClose])

  return children({ open, close, isOpen })
}

const OAUTH_SUCCESS_DELAY = 300

export function OAuthPopupBridge() {
  useEffect(() => {
    if (!window.opener) return
    window.opener.postMessage({ type: 'oauth:success' }, window.location.origin)
    const timer = window.setTimeout(() => window.close(), OAUTH_SUCCESS_DELAY)
    return () => window.clearTimeout(timer)
  }, [])

  return null
}
