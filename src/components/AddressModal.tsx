import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPostalCode } from "@/API";
import { Label } from "@/components/ui/label";
import InputMask from "react-input-mask";
import { debounce } from "lodash";

const ADDRESS_LOCAL_STORAGE_KEY = "pede-ai-address";

type AddressModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: string) => void | Promise<void>;
};

type AddressModalStep = "postalCode" | "address";

const STEPS: Record<AddressModalStep, React.FC<StepProps>> = {
  postalCode: PostalCodeStep,
  address: AddressStep,
};

export function AddressModal({
  isOpen,
  onClose,
  onConfirm,
}: AddressModalProps) {
  const [step, setStep] = useState<AddressModalStep>("postalCode");
  useEffect(() => {
    const localAddress = localStorage.getItem(ADDRESS_LOCAL_STORAGE_KEY);
    const address = localAddress ? JSON.parse(localAddress) : null;
    if (address && address.address.length > 0) {
      setStep("address");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Step = STEPS[step];
  const nextStep = (address?: string) => {
    const currentStepIndex = Object.keys(STEPS).indexOf(step);
    const nextStep = Object.keys(STEPS)[
      currentStepIndex + 1
    ] as AddressModalStep;

    if (!nextStep) {
      onConfirm(address as string);
      return;
    }

    setStep(nextStep);
  };

  return (
    <AddressProvider>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogTitle>Endereço de entrega</DialogTitle>
          <Step nextStep={nextStep} />
        </DialogContent>
      </Dialog>
    </AddressProvider>
  );
}

type StepProps = {
  nextStep: (address?: string) => void;
};

function PostalCodeStep({ nextStep }: StepProps) {
  const [loading, setLoading] = useState(false);
  const postalCodeRef = useRef<HTMLInputElement>(null);
  const { setAddress } = useAddress();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await getPostalCode(postalCodeRef.current?.value || "");
      setAddress({
        address: `${response.city}, ${response.neighborhood}, ${response.street}`,
      });
      nextStep();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedPostalCode = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value.length === 9) {
        handleSubmit(e);
      }
    }, 800),
    [],
  );

  useEffect(() => {
    const localAddress = localStorage.getItem(ADDRESS_LOCAL_STORAGE_KEY);
    const address = localAddress ? JSON.parse(localAddress) : null;
    if (address && address.address.length > 0) {
      setAddress({ address: address });
      nextStep();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Label>CEP</Label>
        {/* @ts-ignore */}
        <InputMask
          mask="99999-999"
          ref={postalCodeRef}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            debouncedPostalCode(e);
          }}
          readOnly={loading}
          maskChar={null}
        >
          {
            // @ts-ignore
            (inputProps) => (
              <Input
                {...inputProps}
                placeholder="Digite seu CEP"
                className="mt-1"
              />
            )
          }
        </InputMask>
      </div>

      <div className="flex justify-end mt-4">
        <Button type="submit" disabled={loading}>
          Buscar endereço
        </Button>
      </div>
    </form>
  );
}

function AddressStep({ nextStep }: StepProps) {
  const { address, handleAddressChange, addressToLine } = useAddress();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep(addressToLine());
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Label>Endereço</Label>
        <Input
          placeholder="Digite seu endereço"
          value={address.address}
          onChange={handleAddressChange("address")}
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 my-4">
        <div>
          <Label>Número</Label>
          <Input
            placeholder="Digite o número"
            value={address.number}
            onChange={handleAddressChange("number")}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Complemento</Label>
          <Input
            placeholder="Digite o complemento"
            value={address.complement}
            onChange={handleAddressChange("complement")}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Referência (opcional)</Label>
        <Input
          placeholder="Digite uma referência (caso necessário)"
          value={address.reference}
          onChange={handleAddressChange("reference")}
          className="mt-1"
        />
      </div>

      <div className="flex justify-end mt-4">
        <Button type="submit">Confirmar</Button>
      </div>
    </form>
  );
}

type Address = {
  address: string;
  number: string;
  complement: string;
  reference: string;
};

type AddressContextProps = {
  address: Address;
  setAddress: (address: Partial<Address>) => void;
  handleAddressChange: (
    k: keyof Address,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  addressToLine: () => string;
};

const AddressContext = createContext<AddressContextProps>({
  address: {
    address: "",
    number: "",
    complement: "",
    reference: "",
  },
  setAddress: () => {},
  addressToLine: () => "",
  handleAddressChange: () => () => {},
});

function AddressProvider({ children }: { children: React.ReactNode }) {
  const firstBoot = useRef<boolean>(true);
  const [address, _setAddress] = useState<Address>({
    address: "",
    number: "",
    complement: "",
    reference: "",
  });

  const setAddress = (address: Partial<Address>) => {
    _setAddress((prev) => ({ ...prev, ...address }));
  };

  const handleAddressChange =
    (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setAddress({ [k]: e.target.value });
    };

  useEffect(() => {
    if (firstBoot.current) {
      firstBoot.current = false;
      const localAddress = localStorage.getItem(ADDRESS_LOCAL_STORAGE_KEY);
      if (localAddress) {
        setAddress(JSON.parse(localAddress));
      }
      return;
    }

    if (address.address.length > 0) {
      localStorage.setItem(ADDRESS_LOCAL_STORAGE_KEY, JSON.stringify(address));
    }
  }, [address]);

  const toLine = useCallback(() => {
    const parts = [address.address, ", ", address.number];
    if (address.complement) {
      parts.push(` - ${address.complement}`);
    }

    if (address.reference) {
      parts.push(`, ${address.reference}`);
    }

    return parts.join("");
  }, [address]);

  return (
    <AddressContext.Provider
      value={{
        address,
        setAddress,
        handleAddressChange,
        addressToLine: toLine,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

function useAddress() {
  return useContext(AddressContext);
}
