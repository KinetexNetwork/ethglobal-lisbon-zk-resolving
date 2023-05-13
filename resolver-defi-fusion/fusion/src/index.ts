import { FusionSDK, NetworkEnum, PrivateKeyProviderConnector } from '@1inch/fusion-sdk';
import bodyParser from 'body-parser';
import express, { Application, Request, Response } from 'express';
import Web3 from 'web3';
require('dotenv').config()

const PORT = 10400;

const app: Application = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true }));


const makerPrivateKey = process.env['FUSION_MAKER_PRIVATE_KEY']!;
const makerAddress = process.env['FUSION_MAKER_ADDRESS']!;
const ethNodeUrl = process.env['FUSION_ETH_NODE_URL']!;
const gnosisNodeUrl = process.env['FUSION_GNOSIS_NODE_URL']!;

const ethProvider = new PrivateKeyProviderConnector(makerPrivateKey, new Web3(ethNodeUrl));

const gnosisProvider = new PrivateKeyProviderConnector(makerPrivateKey, new Web3(gnosisNodeUrl));

const ethSdk = new FusionSDK({
  url: 'https://fusion.1inch.io',
  network: NetworkEnum.ETHEREUM,
  blockchainProvider: ethProvider,
});
const gnosisSdk = new FusionSDK({
  url: 'https://fusion.1inch.io',
  network: NetworkEnum.GNOSIS,
  blockchainProvider: gnosisProvider,
});

app.get('/api/v0/quote', async (req: Request, res: Response): Promise<Response> => {
  let quote;
  console.log(req.query);
  switch (req.query.chain) { 
    case '100':
      quote = await gnosisSdk
        .getQuote({
          fromTokenAddress: (req.query.fromTokenAddress as string),
          toTokenAddress: (req.query.toTokenAddress as string),
          amount: (req.query.amount as string),
        });
    case '1':
      quote = await ethSdk
        .getQuote({
          fromTokenAddress: (req.query.fromTokenAddress  as string),
          toTokenAddress: (req.query.toTokenAddress  as string),
          amount: (req.query.amount  as string),
        });
  }
  console.log(quote)
  return res.status(200).send({
    toAmount: parseInt(quote?.toTokenAmount!) - parseInt(quote?.presets.medium.tokenFee!),
  });
});

app.post('/api/v0/order', async (req: Request, res: Response): Promise<Response> => {
  console.log(req.body);
  switch (req.body.chain) {
    case '100':
      gnosisSdk
        .placeOrder({
          fromTokenAddress: req.body.fromTokenAddress,
          toTokenAddress: req.body.toTokenAddress,
          amount: req.body.amount,
          walletAddress: makerAddress,
        })
        .then(console.log);
    case '1':
      ethSdk
        .placeOrder({
          fromTokenAddress: req.body.fromTokenAddress,
          toTokenAddress: req.body.toTokenAddress,
          amount: req.body.amount,
          walletAddress: makerAddress,
        })
        .then(console.log);
  }

  return res.status(200).send({
    ok: true,
  });
});

try {
  app.listen(PORT, (): void => {
    console.log(`Listening on port ${PORT}...`);
  });
} catch (error) {
  console.error(`Error occurred: ${error}`);
}
