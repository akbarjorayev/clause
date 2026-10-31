// Muse answered with an error status or with something that isn't the JSON we asked for.
export class MuseResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MuseResponseError";
  }
}
