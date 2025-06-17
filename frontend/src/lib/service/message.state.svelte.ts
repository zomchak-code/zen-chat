import { getContext, setContext } from "svelte";

class ChatState {
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
          const lines = decoder.decode(value).split("\n").filter(line => line);

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
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    })();
  }
}

const streams: Record<string, ChatState> = {};

export function setStream(chat: string, reader: ReadableStreamDefaultReader<unknown>) {
  streams[chat] = new ChatState(chat, reader);
}

export function getStream(chat: string): ChatState | undefined {
  return streams[chat];
}


function onStreaming(chat: string, reader: ReadableStreamDefaultReader<unknown>) {
  setStream(chat, reader);
}

export function setOnStreaming() {
  return setContext("onStreaming", onStreaming);
}

export function getOnStreaming(): typeof onStreaming {
  return getContext("onStreaming");
}