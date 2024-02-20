// META: script=/resources/testdriver.js
// META: script=/common/utils.js
// META: script=resources/fledge-util.sub.js
// META: script=/common/subset-tests.js
// META: timeout=long
// META: variant=?1-last

"use strict;"

// The auction is run with the seller being the same as the document origin.
// The request to fetch additional bids must be issued to the seller's origin
// for ad auction headers interception to associate it with this auction.
const SINGLE_SELLER_AUCTION_SELLER = window.location.origin;

// Single-seller auction with a single buyer who places a single additional
// bid. As the only bid, this wins.
subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  const auctionNonce = await navigator.createAuctionNonce();
  const seller = SINGLE_SELLER_AUCTION_SELLER;

  const buyer = OTHER_ORIGIN1;
  const additionalBid = createAdditionalBid(
    uuid, auctionNonce, seller, buyer, 'horses', 1.99);

  await runBasicFledgeAuctionAndNavigate(test, uuid, {
    interestGroupBuyers: [buyer],
    auctionNonce: auctionNonce,
    additionalBids: fetchAdditionalBids(seller, auctionNonce, [additionalBid])
  });

  await waitForObservedRequests(
    uuid, [createSellerReportURL(uuid), createBidderReportURL(uuid, 'horses')]);
}, 'single valid additional bid');

// Single-seller auction with a two buyers competing with additional bids.
subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  const auctionNonce = await navigator.createAuctionNonce();
  const seller = SINGLE_SELLER_AUCTION_SELLER;

  const buyer1 = OTHER_ORIGIN1;
  const additionalBid1 = createAdditionalBid(
    uuid, auctionNonce, seller, buyer1, 'horses', 1.99);

  const buyer2 = OTHER_ORIGIN2;
  const additionalBid2 = createAdditionalBid(
    uuid, auctionNonce, seller, buyer2, 'planes', 2.99);

  await runBasicFledgeAuctionAndNavigate(test, uuid, {
    interestGroupBuyers: [buyer1, buyer2],
    auctionNonce: auctionNonce,
    additionalBids: fetchAdditionalBids(
      seller, auctionNonce, [additionalBid1, additionalBid2])
  });

  await waitForObservedRequests(
    uuid, [createSellerReportURL(uuid), createBidderReportURL(uuid, 'planes')]);
}, 'two valid additional bids');

// Same as the test above, except that this uses two Fetch requests instead of
// one to retrieve the additional bids.
subsetTest(promise_test, async test => {
  const uuid = generateUuid(test);
  const auctionNonce = await navigator.createAuctionNonce();
  const seller = SINGLE_SELLER_AUCTION_SELLER;

  const buyer1 = OTHER_ORIGIN1;
  const additionalBid1 = createAdditionalBid(
    uuid, auctionNonce, seller, buyer1, 'horses', 1.99);

  const buyer2 = OTHER_ORIGIN2;
  const additionalBid2 = createAdditionalBid(
    uuid, auctionNonce, seller, buyer2, 'planes', 2.99);

  await runBasicFledgeAuctionAndNavigate(test, uuid, {
    interestGroupBuyers: [buyer1, buyer2],
    auctionNonce: auctionNonce,
    additionalBids: Promise.all([
      fetchAdditionalBids(seller, auctionNonce, [additionalBid1]),
      fetchAdditionalBids(seller, auctionNonce, [additionalBid2])
    ])
  });

  await waitForObservedRequests(
    uuid, [createSellerReportURL(uuid), createBidderReportURL(uuid, 'planes')]);
}, 'two valid additional bids from two distinct Fetch requests');
