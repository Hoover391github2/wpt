// META: global=window,dedicatedworker
// META: script=/webcodecs/video-encoder-utils.js
// META: variant=?av1
// META: variant=?vp8
// META: variant=?vp9_p0
// META: variant=?vp9_p2
// META: variant=?h264_avc
// META: variant=?h264_annexb

var ENCODER_CONFIG = null;
promise_setup(async () => {
  const config = {
    // FIXME: AV1 and H.264 have embedded color space information too.
    '?av1': {codec: 'av01.0.04M.08'},
    '?vp8': {codec: 'vp8', hasEmbeddedColorSpace: false},
    '?vp9_p0': {codec: 'vp09.00.10.08', hasEmbeddedColorSpace: true},
    '?vp9_p2': {codec: 'vp09.02.10.10', hasEmbeddedColorSpace: true},
    '?h264_avc': {codec: 'avc1.42001E', avc: {format: 'avc'}},
    '?h264_annexb': {codec: 'avc1.42001E', avc: {format: 'annexb'}}
  }[location.search];
  config.hardwareAcceleration = 'prefer-software';
  config.width = 320;
  config.height = 200;
  config.bitrate = 1000000;
  config.bitrateMode = "constant";
  config.framerate = 30;
  ENCODER_CONFIG = config;
});

async function runFullCycleTest(t, options) {
  let encoder_config = { ...ENCODER_CONFIG };
  const w = encoder_config.width;
  const h = encoder_config.height;
  let next_ts = 0
  let frames_to_encode = 16;
  let frames_encoded = 0;
  let frames_decoded = 0;

  await checkEncoderSupport(t, encoder_config);
  let decoder = new VideoDecoder({
    output(frame) {
      assert_equals(frame.visibleRect.width, w, "visibleRect.width");
      assert_equals(frame.visibleRect.height, h, "visibleRect.height");
      assert_equals(frame.timestamp, next_ts++, "decode timestamp");

      // The encoder is allowed to change the color space to satisfy the
      // encoder when readback is needed to send the frame for encoding, so
      // just ensure we have something set on the frame.
      assert_not_equals(
          frame.colorSpace.primaries, null, 'colorSpace.primaries');
      assert_not_equals(frame.colorSpace.transfer, null, 'colorSpace.transfer');
      assert_not_equals(frame.colorSpace.matrix, null, 'colorSpace.matrix');
      assert_not_equals(
          frame.colorSpace.fullRange, null, 'colorSpace.fullRange');

      frames_decoded++;
      assert_true(validateBlackDots(frame, frame.timestamp),
        "frame doesn't match. ts: " + frame.timestamp);
      frame.close();
    },
    error(e) {
      assert_unreached(e.message);
    }
  });

  let next_encode_ts = 0;
  const encoder_init = {
    output(chunk, metadata) {
      let config = metadata.decoderConfig;
      if (config) {
        config.hardwareAcceleration = encoder_config.hardwareAcceleration;

        // Removes the color space provided by the encoder so that color space
        // information in the underlying bitstream is exposed during decode.
        if (options.stripDecoderConfigColorSpace)
          config.colorSpace = {};

        decoder.configure(config);
      }
      decoder.decode(chunk);
      frames_encoded++;
      assert_equals(chunk.timestamp, next_encode_ts++, "encode timestamp");
    },
    error(e) {
      assert_unreached(e.message);
    }
  };

  let encoder = new VideoEncoder(encoder_init);
  encoder.configure(encoder_config);

  for (let i = 0; i < frames_to_encode; i++) {
    let frame = createDottedFrame(w, h, i);

    // Frames should have a valid color space when created from canvas.
    assert_not_equals(frame.colorSpace.primaries, null, 'colorSpace.primaries');
    assert_not_equals(frame.colorSpace.transfer, null, 'colorSpace.transfer');
    assert_not_equals(frame.colorSpace.matrix, null, 'colorSpace.matrix');
    assert_not_equals(frame.colorSpace.fullRange, null, 'colorSpace.fullRange');

    let keyframe = (i % 5 == 0);
    encoder.encode(frame, { keyFrame: keyframe });
    frame.close();
  }
  await encoder.flush();
  await decoder.flush();
  encoder.close();
  decoder.close();
  assert_equals(frames_encoded, frames_to_encode, "frames_encoded");
  assert_equals(frames_decoded, frames_to_encode, "frames_decoded");
}

promise_test(async t => {
  return runFullCycleTest(t, {});
}, 'Encoding and decoding cycle');

promise_test(async t => {
  if (ENCODER_CONFIG.hasEmbeddedColorSpace)
    return runFullCycleTest(t, {stripDecoderConfigColorSpace: true});
}, 'Encoding and decoding cycle w/ stripped color space');
