import { Button, Menu, Text, Avatar, Group, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { IconWallet, IconChevronDown, IconLogout, IconHelp } from '@tabler/icons-react';
import { WalletHelpModal } from './WalletHelpModal';
import { useDisclosure } from '@mantine/hooks';

export function ConnectWallet() {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: balance } = useBalance({ address });

    if (isConnected && address) {
        return (
            <Menu shadow="md" width={200}>
                <Menu.Target>
                    <Button variant="light" color="gray" leftSection={<IconWallet size={18} />}>
                        <Group gap={6}>
                            <Text size="sm">{address.slice(0, 6)}...{address.slice(-4)}</Text>
                            {chain && <Badge size="xs" color="blue">{chain.name}</Badge>}
                        </Group>
                    </Button>
                </Menu.Target>
                <Menu.Dropdown>
                    <div className="p-2 border-b mb-2">
                        <Text size="xs" c="dimmed">Balance</Text>
                        <Text fw={700}>{(balance as any)?.formatted?.slice(0, 6)} {balance?.symbol}</Text>
                    </div>
                    <Menu.Item leftSection={<IconLogout size={14} />} color="red" onClick={() => disconnect()}>
                        Disconnect
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        );
    }

    const handleConnect = (connector: any) => {
        connect({ connector }, {
            onError: (err) => alert(`Connection Failed: ${err.message}`)
        });
    };

    const [helpOpen, { open: openHelp, close: closeHelp }] = useDisclosure(false);

    return (
        <>
            <Group gap="xs">
                <Menu shadow="md" width={200}>
                    <Menu.Target>
                        <Button
                            variant="gradient"
                            gradient={{ from: 'orange', to: 'red' }}
                            leftSection={<IconWallet size={18} />}
                        >
                            Connect Wallet
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>Select Wallet</Menu.Label>
                        {connectors.map((connector) => (
                            <Menu.Item
                                key={connector.uid}
                                onClick={() => handleConnect(connector)}
                                leftSection={<IconWallet size={14} />}
                            >
                                {connector.name}
                            </Menu.Item>
                        ))}
                        {connectors.length === 0 && <Menu.Item disabled>No Wallets Detected</Menu.Item>}
                    </Menu.Dropdown>
                </Menu>

                <Tooltip label="How to get a Testnet Wallet?">
                    <ActionIcon variant="light" color="gray" size="lg" onClick={openHelp}>
                        <IconHelp size={20} />
                    </ActionIcon>
                </Tooltip>
            </Group>

            <WalletHelpModal opened={helpOpen} onClose={closeHelp} />
        </>
    );
}
