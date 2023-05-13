export class Canceller {
  private cancelled_ = false;

  get cancelled(): boolean {
    return this.cancelled_;
  }

  cancel(): void {
    this.cancelled_ = true;
  }
}

export type CancellableFunc = (canceller: Canceller) => Promise<void>;
export type CancelFunc = () => void;

export const cancellable = (func: CancellableFunc): CancelFunc => {
  const canceller = new Canceller();

  func(canceller);

  return () => {
    canceller.cancel();
  };
};
