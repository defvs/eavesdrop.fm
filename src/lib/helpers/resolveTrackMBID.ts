import type MBIDs from '$lib/typing/mbids';

const resolveMBIDs = async (track_mbid: string | undefined): Promise<MBIDs> => {
    // Create an instance of MBIDs
    const mbids: MBIDs = {
        release_mbid: undefined,
        recording_mbid: undefined,
        track_mbid: track_mbid
    };
    if (track_mbid === undefined) return mbids;

    // Define the URL to call the MusicBrainz API
    const url = `http://musicbrainz.org/ws/2/release?track=${track_mbid}&fmt=json`;

    try {
        // Make the API call to get the release information
        const response = await fetch(url);
        const result = await response.json();

        // Put result.releases[0].id into MBIDs.release_mbid
        mbids.release_mbid = result.releases[0].id;

        // Find in the array result.releases[0].media, the media with media.id == track_mbid
        // and get media.recording.id into MBIDs.recording_mbid
        const media = result.releases[0].media.find((m: any) => m.track.some((t: any) => t.id === track_mbid));
        if (media) {
            const track = media.track.find((t: any) => t.id === track_mbid);
            if (track) {
                mbids.recording_mbid = track.recording.id;
            }
        }

        // Put track_mbid into MBIDs.track_mbid
        mbids.track_mbid = track_mbid;
    } catch (error) {
        console.info('Error resolving track MBID:', error);
    }

    return mbids;
};

export default resolveMBIDs;
