import { createConfig, http } from 'wagmi';
import { sepolia, hardhat } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { injected, metaMask, safe } from 'wagmi/connectors';

export const config = createConfig({
    chains: [sepolia, hardhat],
    connectors: [
        injected(),
        metaMask(),
        safe(),
    ],
    transports: {
        [sepolia.id]: http(),
        [hardhat.id]: http(),
    },
});

export const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
