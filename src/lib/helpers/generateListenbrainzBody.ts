import type Payload from '$lib/typing/payload';
import resolveMBIDs from '$lib/helpers/resolveTrackMBID';

// generate the body required by LB: https://listenbrainz.readthedocs.io/en/latest/dev/json/#submission-json
const generateListenbrainzBody = async (body: Payload) => {
	let track_mbid = body.Metadata?.Guid?.[0]?.id?.match(/mbid:\/\/([a-fA-F0-9\\-]*){1}\s*/)?.[0]
	let mbids = await resolveMBIDs(track_mbid)

	let payload = {
		listen_type: body.event === 'media.scrobble' ? 'single' : 'playing_now',
		payload: [
			{
				listened_at: body.event === 'media.scrobble' ? Math.floor(Date.now() / 1000) : undefined,
				track_metadata: {
					additional_info: {
						listening_from: 'Plex'
					},
					artist_name: body.Metadata.originalTitle ?? body.Metadata.grandparentTitle,
					track_name: body.Metadata.title,
					release_name: body.Metadata.parentTitle,
					...(mbids.release_mbid && { release_mbid: mbids.release_mbid }),
					...(mbids.recording_mbid && { recording_mbid: mbids.recording_mbid }),
					...(mbids.track_mbid && { track_mbid: mbids.track_mbid })
				}
			}
		]
	}
	console.log(JSON.stringify(payload));

	return JSON.stringify(payload)
};

export default generateListenbrainzBody;
