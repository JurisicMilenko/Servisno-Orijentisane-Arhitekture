const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, './proto/rating.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  enums: String,
  defaults: true,
  oneofs: true,
});

const blogRatingProto = grpc.loadPackageDefinition(packageDefinition).rating;

const BLOG_RATING_GRPC = process.env.BLOG_RATING_GRPC || 'blog-service:50051';

const blogRatingClient = new blogRatingProto.BlogRatingGrpc(
  BLOG_RATING_GRPC,
  grpc.credentials.createInsecure()
);

module.exports = blogRatingClient;
