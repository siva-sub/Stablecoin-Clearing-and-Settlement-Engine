import { PaymentInstruction } from './types';

export class ISO20022Generator {

    static generatePacs008(payment: PaymentInstruction): string {
        const timestamp = new Date().toISOString().split('.')[0]; // YYYY-MM-DDThh:mm:ss
        const msgId = `SCSE/${new Date().getFullYear()}/${payment.id.slice(0, 8)}`;

        return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
    <FIToFICstmrCdtTrf>
        <GrpHdr>
            <MsgId>${msgId}</MsgId>
            <CreDtTm>${timestamp}</CreDtTm>
            <NbOfTxs>1</NbOfTxs>
            <TtlIntrBkSttlmAmt Ccy="USD">${payment.amount.toFixed(2)}</TtlIntrBkSttlmAmt>
            <SttlmInf>
                <SttlmMtd>CLRG</SttlmMtd>
                <ClrSys>
                    <Prtry>SCSE</Prtry>
                </ClrSys>
            </SttlmInf>
        </GrpHdr>
        <CdtTrfTxInf>
            <PmtId>
                <InstrId>${payment.id}</InstrId>
                <EndToEndId>${payment.id}</EndToEndId>
                <TxId>${payment.id}</TxId>
            </PmtId>
            <IntrBkSttlmAmt Ccy="USD">${payment.amount.toFixed(2)}</IntrBkSttlmAmt>
            <InstdAmt Ccy="USD">${payment.amount.toFixed(2)}</InstdAmt>
            <ChrgBr>DEBT</ChrgBr>
            <Dbtr>
                <Nm>${payment.debtorAgent}</Nm>
                <FinInstnId>
                    <BICFI>${this.mockBIC(payment.debtorAgent)}</BICFI>
                </FinInstnId>
            </Dbtr>
            <Cdtr>
                <Nm>${payment.creditorAgent}</Nm>
                <FinInstnId>
                    <BICFI>${this.mockBIC(payment.creditorAgent)}</BICFI>
                </FinInstnId>
            </Cdtr>
            <RmtInf>
                <Ustrd>SCSE Settlement / Ref: ${payment.id.slice(0, 6)}</Ustrd>
            </RmtInf>
        </CdtTrfTxInf>
    </FIToFICstmrCdtTrf>
</Document>`;
    }

    private static mockBIC(agentName: string): string {
        // Generate a consistent Mock BIC based on the name
        const prefix = agentName.replace(/[^A-Z]/g, '').padEnd(4, 'X').slice(0, 4);
        return `${prefix}US33XXX`;
    }
}
