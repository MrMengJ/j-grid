import { isFunction } from 'lodash';

/**
 * options {
 *   protocols  一个协议字符串或者一个包含协议字符串的数组,作为webSocket实例化的参数
 *   heartCheckInterval  心跳检测时间间隔
 *   serviceTimeout  检测服务端是否关闭的超时时间
 *   reconnectInterval  重新连接时间间隔
 *   maxReconnectCount  最大重新连接次数
 *   onReconnect  重新连接事件回调
 *   onMaxReconnect  已达最大连接次数事件回调
 *   onOpen  webSocket onOpen事件回调
 *   onError  webSocket onError事件回调
 *   onMessage  webSocket onMessage事件回调
 *   onClose  webSocket onClose事件回调
 * }
 */

class ConnectingWebSocket {
  constructor(url, options = {}) {
    this.socket = null;
    this.url = url;
    this.options = options;
    this.CONNECTING = WebSocket.CONNECTING;
    this.OPEN = WebSocket.OPEN;
    this.CLOSING = WebSocket.CLOSING;
    this.CLOSED = WebSocket.CLOSED;
    this.reconnectTimer = null; // 重新连接计时器
    this.reconnectCount = 0; // 重新连接次数
    this.serviceIsClosed = false; // 服务端是否已断掉连接
    this.heartCheck = this.produceHeartCheck(); // 心跳检测对象

    this.init();
  }

  /**
   * init 初始化
   */
  init() {
    const { protocols } = this.options;
    try {
      this.socket = new WebSocket(this.url, protocols);
      this.socket.onopen = this.onOpen;
      this.socket.onmessage = this.onMessage;
      this.socket.onclose = this.onClose;
      this.socket.onerror = this.onError;
    } catch (error) {
      throw error;
    }
  }

  /**
   * produceHeartCheck 生产心跳检测对象
   * @return {{serviceTimeout: number, serviceTimer: null, start: start, reset: (function(): reset), clientTimeout: number, clientTimer: null}}
   */
  produceHeartCheck() {
    const { heartCheckInterval, serviceTimeout } = this.options;
    const that = this;
    return {
      clientTimeout: heartCheckInterval || 5000,
      serviceTimeout: serviceTimeout || 5000,
      clientTimer: null,
      serviceTimer: null,
      reset: function () {
        clearTimeout(this.clientTimer);
        clearTimeout(this.serviceTimer);
        return this;
      },
      start: function () {
        this.clientTimer && clearTimeout(this.clientTimer);
        this.serviceTimer && clearTimeout(this.serviceTimer);
        this.clientTimer = setTimeout(() => {
          //这里发送一个心跳，服务端收到后，返回一个心跳消息
          //onmessage拿到返回的心跳就说明连接正常
          that.sendMessage('Heartbeat');
          this.serviceTimer = setTimeout(function () {
            // 如果超过一定时间还没重置，说明服务端已经主动断开了
            that.serviceIsClosed = true;
            that.closeSocket();
          }, this.serviceTimeout);
        }, this.clientTimeout);
      },
    };
  }

  /**
   * webSocket 连接
   */
  connect() {
    try {
      this.init();
    } catch (e) {
      this.reconnect();
    }
  }

  /**
   * webSocket 重连
   */
  reconnect() {
    // 避免重复连接
    if (this.reconnectTimer) {
      return;
    }
    const {
      reconnectInterval = 3000,
      maxReconnectCount,
      onReconnect,
      onMaxReconnect,
    } = this.options;
    // 已达最大重连次数限制
    if (maxReconnectCount && this.reconnectCount > maxReconnectCount) {
      if (onMaxReconnect) {
        onMaxReconnect();
      }
    } else {
      this.reconnectTimer = setTimeout(() => {
        this.connect();
        this.reconnectCount++;
        clearTimeout(this.reconnectTimer);
        if (onReconnect) {
          onReconnect();
        }
      }, reconnectInterval);
    }
  }

  onOpen = (event) => {
    // 心跳重新检测
    this.heartCheck.reset().start();

    // 重置连接次数
    this.reconnectCount = 0;

    const { onOpen } = this.options;
    if (isFunction(onOpen)) {
      onOpen(event);
    }
  };

  onError = (event) => {
    if (!this.serviceIsClosed) {
      this.reconnect();
    }

    const { onError } = this.options;
    if (isFunction(onError)) {
      onError(event);
    }
  };

  onMessage = (event) => {
    // 心跳重新检测
    this.heartCheck.reset().start();

    const { onMessage } = this.options;
    if (isFunction(onMessage)) {
      onMessage(event);
    }
  };

  onClose = (event) => {
    //
    this.heartCheck.reset();

    if (!this.serviceIsClosed) {
      this.reconnect();
    }

    const { onClose } = this.options;
    if (isFunction(onClose)) {
      onClose(event);
    }
  };

  /**
   * 发送消息
   * @param data
   */
  sendMessage(data) {
    if (this.socket && this.socket.readyState === this.OPEN) {
      this.socket.send(data);
    }
  }

  /**
   * 关闭webSocket
   * @param args
   */
  closeSocket(...args) {
    if (this.socket) {
      this.socket.close(...args);
    }
  }

  /**
   * 刷新，在连接次数达最大次数之后，可使用此方法刷新
   */
  refresh() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.socket = null;
    this.reconnectCount = 0;
    this.serviceIsClosed = false;
    this.connect();
  }

  /**
   * 销毁
   */
  destory() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default ConnectingWebSocket;
