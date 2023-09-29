import './App.css';
import Game from './Game';
import { WagmiConfig, configureChains, createClient, useNetwork } from 'wagmi';
import { RainbowKitProvider, darkTheme, getDefaultWallets } from '@rainbow-me/rainbowkit';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import '@rainbow-me/rainbowkit/styles.css';
import { sapphireJsonRpcProvider } from 'wagmi-sapphire-provider';
import DocumentTitle from 'react-document-title';


function App() {
  const eternovaQuickBattlesChain = {
    id: 23295,
    name: 'SapphireTestnet',
    network: 'SapphireTestnet',
    nativeCurrency: {
      name: 'TEST',
      symbol: '$',
      decimals: 18,
    },
    rpcUrls: {
      default: 'https://testnet.sapphire.oasis.dev',
    },
    testnet: true,
    blockExplorers: {
      default: { name: 'Sapphire Explorer', url: 'https://testnet.explorer.sapphire.oasis.dev' }
    }
  };

  const { chains, provider } = configureChains(
    [eternovaQuickBattlesChain],
    [
      sapphireJsonRpcProvider({
        rpc: (chain) => {
          return { http: chain.rpcUrls.default };
        },
      }),
    ],
  );

  const { connectors } = getDefaultWallets({
    appName: "Eternova Quick Battles",
    projectId: 'c0516b9c5df7d317ef86917eb2f05379',
    chains,
  });

  const client = createClient({
    autoConnect: true,
    connectors: connectors,
    provider,
  });
  

  return (
    <>
    <DocumentTitle title="Eternova Quick Battles" />
    <WagmiConfig client={client}>
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: '#7b3fe4',
          accentColorForeground: 'white',
          borderRadius: 'small',
          fontStack: 'system',
          overlayBlur: 'small',
        })}
        chains={chains}>

        <BrowserRouter>
          <Routes>
            <Route exact path='/' element={<Game />} />
          </Routes>
        </BrowserRouter>
      </RainbowKitProvider>
    </WagmiConfig></>
  );
}

export default App;
