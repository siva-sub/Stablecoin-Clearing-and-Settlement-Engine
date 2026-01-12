import { Modal, Text, Button, List, Title, ThemeIcon, Anchor, Alert } from '@mantine/core';
import { IconWallet, IconCoin, IconExternalLink, IconInfoCircle } from '@tabler/icons-react';

interface WalletHelpModalProps {
    opened: boolean;
    onClose: () => void;
}

export function WalletHelpModal({ opened, onClose }: WalletHelpModalProps) {
    return (
        <Modal opened={opened} onClose={onClose} title="Setting up a Testnet Wallet" size="lg">
            <Alert variant="light" color="blue" title="What is this?" icon={<IconInfoCircle />} mb="md">
                To interact with the SCSE Blockchain Settlement, you need a <b>Web3 Wallet</b> connected to the <b>Sepolia Testnet</b>. This allows you to simulate bank-to-bank transfers safely.
            </Alert>

            <List spacing="md" icon={<ThemeIcon color="teal" size={24} radius="xl"><IconWallet size={16} /></ThemeIcon>}>
                <List.Item>
                    <Title order={5}>1. Install a Wallet</Title>
                    <Text size="sm">
                        Calculators and Ledgers are internal, but Settlement happens on the public internet.
                        Install <Anchor href="https://metamask.io/" target="_blank">MetaMask</Anchor> or use <Anchor href="https://rabby.io/" target="_blank">Rabby</Anchor> as a browser extension.
                    </Text>
                </List.Item>

                <List.Item icon={<ThemeIcon color="orange" size={24} radius="xl"><IconCoin size={16} /></ThemeIcon>}>
                    <Title order={5}>2. Get Testnet Funds (Sepolia ETH)</Title>
                    <Text size="sm" mb="xs">
                        Transactions on Sepolia are free, but you need "gas" to pay for them. You can get free test ETH from "Faucets".
                    </Text>
                    <List withPadding size="sm">
                        <List.Item><Anchor href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank">Google Cloud Faucet <IconExternalLink size={12} /></Anchor> (Fast)</List.Item>
                        <List.Item><Anchor href="https://sepolia-faucet.pk910.de/" target="_blank">PoW Faucet <IconExternalLink size={12} /></Anchor> (No Login)</List.Item>
                        <List.Item><Anchor href="https://www.alchemy.com/faucets/ethereum-sepolia" target="_blank">Alchemy Faucet <IconExternalLink size={12} /></Anchor> (Requires Login)</List.Item>
                    </List>
                </List.Item>

                <List.Item>
                    <Title order={5}>3. Connect & Transact</Title>
                    <Text size="sm">
                        Once you have ETH, click "Connect Wallet" at the top right. You can then approve Settlement batches in the "Engine" tab.
                    </Text>
                </List.Item>
            </List>

            <Button fullWidth onClick={onClose} mt="xl">Got it</Button>
        </Modal>
    );
}
