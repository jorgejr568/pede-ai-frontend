import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import React, { useEffect, useMemo, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { uniq } from "lodash";

export enum PaymentMethodTypeEnum {
  CREDITO = "CREDITO",
  DEBITO = "DEBITO",
  REFEICAO = "REFEICAO",
  DINHEIRO = "DINHEIRO",
}

export const PaymentMethodNameMap: Record<PaymentMethodTypeEnum, string> = {
  [PaymentMethodTypeEnum.CREDITO]: "Cartão de crédito",
  [PaymentMethodTypeEnum.DEBITO]: "Cartão de débito",
  [PaymentMethodTypeEnum.REFEICAO]: "Vale refeição",
  [PaymentMethodTypeEnum.DINHEIRO]: "Dinheiro",
};

export type PaymentMethod = {
  type: PaymentMethodTypeEnum;
  name: string;
  additional_info?: string;
};

const PaymentMethodAdditionalInfoMap: Partial<
  Record<PaymentMethodTypeEnum, React.FC<AdditionalInfoProps>>
> = {
  [PaymentMethodTypeEnum.DINHEIRO]: AdditionalInfoDinheiroComponent,
};

type PaymentMethodModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod) => void | Promise<void>;
};

export function PaymentMethodModal({
  isOpen,
  onClose,
  onConfirm,
}: PaymentMethodModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: PaymentMethodTypeEnum.CREDITO,
    name: PaymentMethodNameMap[PaymentMethodTypeEnum.CREDITO],
  });

  const setAdditionalInfo = (value: string) => {
    setPaymentMethod({
      ...paymentMethod,
      additional_info: value,
    });
  };

  const AdditionalInfoComponent =
    PaymentMethodAdditionalInfoMap[paymentMethod.type];

  const canSubmit = useMemo(() => {
    const requireAdditionalInfo =
      paymentMethod.type in PaymentMethodAdditionalInfoMap;
    return !requireAdditionalInfo || !!paymentMethod.additional_info;
  }, [paymentMethod]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="md:max-w-[800px]">
        <DialogTitle>Forma de pagamento</DialogTitle>

        <div className="flex flex-col mt-4">
          <RadioGroup
            className="flex flex-col md:flex-row justify-center gap-x-8"
            onValueChange={(value) => {
              setPaymentMethod({
                type: value as PaymentMethodTypeEnum,
                name: PaymentMethodNameMap[value as PaymentMethodTypeEnum],
              });
            }}
          >
            {Object.entries(PaymentMethodTypeEnum).map(([key, value]) => {
              return (
                <div className="flex items-center space-x-2" key={key}>
                  <RadioGroupItem
                    value={value}
                    checked={paymentMethod?.type === value}
                    id={`paymentMethod-opt-${value}`}
                  />

                  <Label htmlFor={`paymentMethod-opt-${value}`}>
                    {PaymentMethodNameMap[value as PaymentMethodTypeEnum]}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          {AdditionalInfoComponent && (
            <AdditionalInfoComponent
              value={paymentMethod.additional_info || ""}
              onChange={setAdditionalInfo}
            />
          )}

          <div className="flex justify-end w-full mt-12">
            <Button
              disabled={!canSubmit}
              onClick={() => onConfirm(paymentMethod)}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type AdditionalInfoProps = {
  value: string;
  onChange: (value: string) => void;
};

function AdditionalInfoDinheiroComponent({
  value,
  onChange,
}: AdditionalInfoProps) {
  const { itemsTotalPrice } = useCart();
  const NOTAS = [0, 10, 20, 50, 100];

  const OPTIONS = useMemo<string[]>(() => {
    const startFrom = Math.ceil(itemsTotalPrice / 10) * 10;
    return [
      "Não precisa",
      ...uniq(
        NOTAS.map((nota) => {
          if (nota >= startFrom) {
            return `R$ ${nota},00`;
          }

          return `R$ ${startFrom + nota},00`;
        }),
      ),
    ];
  }, [itemsTotalPrice, NOTAS]);
  const [selectedOption, setSelectedOption] = useState<string>(OPTIONS[0]);

  useEffect(() => {
    onChange(`Troco para: ${selectedOption}`);
  }, [selectedOption, onChange]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <DialogTitle className="my-4">Troco para</DialogTitle>
      <RadioGroup
        onValueChange={setSelectedOption}
        className="flex flex-col md:flex-row justify-center gap-x-3"
      >
        {OPTIONS.map((option, key) => (
          <div key={key} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option}
              checked={selectedOption === option}
              id={`dinheiro-troco-${key}`}
            />
            <Label htmlFor={`dinheiro-troco-${key}`}>{option}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
