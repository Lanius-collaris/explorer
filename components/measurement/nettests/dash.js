import React from 'react'
import PropTypes from 'prop-types'
import {
  Text
} from 'ooni-components'

/*
 * This table is derived from:
 * https://support.google.com/youtube/answer/1722171?hl=en-GB
 */
const minimumBitrateForVideo = [
  {
    'sfr_min_bitrate': 600,
    'hfr_min_bitrate': 1000,
    'type': '240p'
  },
  {
    'sfr_min_bitrate': 1000,
    'hfr_min_bitrate': 1500,
    'type': '360p'
  },
  {
    'sfr_min_bitrate': 2500,
    'hfr_min_bitrate': 4000,
    'type': '480p'
  },
  {
    'sfr_min_bitrate': 5000,
    'hfr_min_bitrate': 7500,
    'type': '720p (HD)'
  },
  {
    'sfr_min_bitrate': 8000,
    'hfr_min_bitrate': 12000,
    'type': '1080p (full HD)'
  },
  {
    'sfr_min_bitrate': 16000,
    'hfr_min_bitrate': 24000,
    'type': '1440p (2k)'
  },
  {
    'sfr_min_bitrate': 35000,
    'hfr_min_bitrate': 53000,
    'type': '2160p (4k)'
  }
]

const getOptimalQualityForBitrate = (testKeys) => {
  let optimalQuality = minimumBitrateForVideo[0]
  minimumBitrateForVideo.forEach((rate) => {
    // Note: we use SFR rather than HFR because SFR is more common
    if (testKeys.simple.median_bitrate >= rate['sfr_min_bitrate']) {
      optimalQuality = rate
    }
  })
  return optimalQuality
}

const DashDetails = ({testKeys}) => {
  const isFailed = testKeys.failure !== null
  const failure = testKeys.failure
  const optimalVideoRate = getOptimalQualityForBitrate(testKeys).type
  const medianBitrate = (testKeys.simple.median_bitrate / 1000).toFixed(2)
  const playoutDelay = (testKeys.simple.min_playout_delay).toFixed(2)

  return <div>
    <Text>
  isFailed: {isFailed}
    </Text>
    <Text>
  failure: {failure}
    </Text>
    <Text>
  optimalVideoRate: {optimalVideoRate}
    </Text>
    <Text>
  medianBitrate: {medianBitrate}
    </Text>
    <Text>
  playoutDelay: {playoutDelay}
    </Text>
  </div>
}

DashDetails.propTypes = {
  testKeys: PropTypes.object
}

export default DashDetails
