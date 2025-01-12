import type {LoaderArgs} from '@remix-run/cloudflare'
import {jsonCORS} from '../../server-utils/responses'

export const loader = async ({request}: LoaderArgs) => {
  const url = new URL(request.url)
  const question = url.searchParams.get('question')
  const onlyLive = url.searchParams.get('onlyLive') == 'true'

  if (!question) return []

  const results = await search(question, onlyLive)
  return jsonCORS(results)
}

export function search(question: string, onlyLive: boolean) {
  const url = `${NLP_SEARCH_ENDPOINT}/api/search?query=${question}&top=5&showLive=${
    onlyLive ? 1 : 0
  }`
  return fetch(url).then(async (response) => {
    if (response.status != 200) {
      const errorMsg = await response.text()
      console.error(url, errorMsg)
      return new Response(errorMsg, {status: 502})
    }
    return await response.json()
  })
}
