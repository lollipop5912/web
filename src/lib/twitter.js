import Qs from "qs";

const findVideos = (data) => {
  const instruction =
    data.threaded_conversation_with_injections_v2.instructions.find(
      ({ type }) => type === "TimelineAddEntries"
    );

  return instruction.entries
    .flatMap((entry) => {
      return entry.content?.itemContent?.tweet_results?.result?.legacy?.extended_entities?.media?.flatMap(
        (media) => {
          return media.video_info.variants.filter(
            (variant) => variant.content_type === "video/mp4"
          );
        }
      );
    })
    .filter((x) => x);
};

export const getVideo = async (statusUrl) => {
  const splitted = statusUrl.split("/");
  const statusId = splitted[splitted.length - 1];
  const variables = {
    focalTweetId: statusId,
    with_rux_injections: false,
    includePromotedContent: true,
    withCommunity: true,
    withQuickPromoteEligibilityTweetFields: true,
    withBirdwatchNotes: true,
    withDownvotePerspective: false,
    withReactionsMetadata: false,
    withReactionsPerspective: false,
    withVoice: true,
    withV2Timeline: true,
  };
  const features = {
    responsive_web_twitter_blue_verified_badge_is_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    tweetypie_unmention_optimization_enabled: true,
    vibe_api_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    tweet_awards_web_tipping_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: false,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: false,
    interactive_text_enabled: true,
    responsive_web_text_conversations_enabled: false,
    longform_notetweets_richtext_consumption_enabled: false,
    responsive_web_enhance_cards_enabled: false,
  };
  const qs = Qs.stringify({
    variables: JSON.stringify(variables),
    features: JSON.stringify(features),
  });
  const url = `https://twitter.com/i/api/graphql/nDM-d-uWksu2D4Xj0Wl_Ig/TweetDetail?${qs}`;
  const res = await fetch(url, {
    headers: {
      authorization: `Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA`,
      "x-guest-token": "1637763495474126849",
    },
  });
  const json = await res.json();

  return findVideos(json.data).sort((a, b) => b.bitrate - a.bitrate)[0].url;
};
