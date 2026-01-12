import { Button, Menu, Text, Avatar, Group, Badge } from '@mantine/core';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { IconWallet, IconChevronDown, IconLogout } from '@tabler/icons-react';

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

    return (
        <Button
            variant="gradient"
            gradient={{ from: 'orange', to: 'red' }}
            onClick={() => connect({ connector: connectors[0] })}
            leftSection={<IconWallet size={18} />}
        >
            Connect Wallet
        </Button>
    );
}
