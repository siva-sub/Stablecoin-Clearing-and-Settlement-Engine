import type { PaymentInstruction } from './types';

export class ISO20022Generator {

    static generatePacs008(payment: PaymentInstruction): string {
        const timestamp = new Date().toISOString().split('.')[0];
        // Use instructionId since 'id' doesn't exist on PaymentInstruction interface
        const id = (payment as any).id || payment.instructionId || "UNKNOWN";
        const msgId = `SCSE/${new Date().getFullYear()}/${id.slice(0, 8)}`;

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
                <InstrId>${id}</InstrId>
                <EndToEndId>${id}</EndToEndId>
                <TxId>${id}</TxId>
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
                <Ustrd>SCSE Settlement / Ref: ${id.slice(0, 6)}</Ustrd>
            </RmtInf>
        </CdtTrfTxInf>
    </FIToFICstmrCdtTrf>
</Document>`;
    }

    private static mockBIC(agentName: string): string {
        const prefix = agentName.replace(/[^A-Z]/g, '').padEnd(4, 'X').slice(0, 4);
        return `${prefix}US33XXX`;
    }
}
