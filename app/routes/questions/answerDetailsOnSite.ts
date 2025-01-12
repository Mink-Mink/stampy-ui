import type {LoaderArgs} from '@remix-run/cloudflare'
import {reloadInBackgroundIfNeeded} from '~/server-utils/kv-cache'
import {loadOnSiteAnswers, loadMoreAnswerDetails} from '~/server-utils/stampy'

export const loader = async ({request}: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams
  const nextPage = searchParams.get('nextPage')
  if (nextPage !== null) {
    return await loadMoreAnswerDetails(request, nextPage || null)
  }
  const {data, timestamp} = await loadOnSiteAnswers(request)
  return {data: {questions: data, nextPageLink: null}, timestamp}
}

export function fetchAnswerDetailsOnSite(nextPage: string | null) {
  let url = `/questions/answerDetailsOnSite`
  if (nextPage !== undefined) {
    url = `${url}?nextPage=${nextPage || ''}`
  }
  return fetch(url).then(async (response) => {
    const {data, timestamp}: Awaited<ReturnType<typeof loader>> = await response.json()
    reloadInBackgroundIfNeeded(url, timestamp)

    return data
  })
}
