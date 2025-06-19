import { getContext, setContext } from "svelte";

class MessageState {
  message: string;
  reader: ReadableStreamReader<unknown>;

  public text = $state("");
  public reasoning = $state("");

  constructor(message: string, reader: ReadableStreamDefaultReader<unknown>) {
    this.message = message;
    this.reader = reader;
    const decoder = new TextDecoder();

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value as AllowSharedBufferSource).split("\n").filter(line => line);

          let event = '';
          let i = 0;
          lines.forEach(line => {
            if (line) {
              if (line.startsWith('event:')) {
                event = line;
                i = 0;
              } else if (line.startsWith('data:')) {
                const text = `${i++ ? '\n' : ''}${line.replaceAll('data: ', '')}`;
                if (event.includes('text')) {
                  this.text += text;
                } else if (event.includes('reasoning')) {
                  this.reasoning += text;
                }
              }
            } else {
              event = '';
            }
          })
        }
      } finally {
        reader.releaseLock();
      }
    })();
  }
}

const streams: Record<string, MessageState> = $state({});

export function setStream(chat: string, reader: ReadableStreamDefaultReader<unknown>) {
  streams[chat] = new MessageState(chat, reader);
}

export function getStream(message: string): MessageState | undefined {
  return streams[message];
}


function onStreaming(message: string, reader: ReadableStreamDefaultReader<unknown>) {
  setStream(message, reader);
}

export function setOnStreaming() {
  return setContext("onStreaming", onStreaming);
}

export function getOnStreaming(): typeof onStreaming {
  return getContext("onStreaming");
}