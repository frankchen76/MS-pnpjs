import { ODataParser, extendFactory, headers } from "@pnp/odata";
import { File } from "@pnp/sp/files";
import { PassThrough } from "stream";

export interface IResponseBodyStream {
    body: PassThrough;
    knownLength: number;
}

export class StreamParser extends ODataParser<IResponseBodyStream> {

    protected parseImpl(r: Response, resolve: (value: any) => void): void {
        resolve({ body: r.body, knownLength: parseInt(r.headers["content-length"], 10) });
    }
}

extendFactory(File, {

    getStream(): Promise<IResponseBodyStream> {
        return this.clone(File, "$value", false).usingParser(new StreamParser())(headers({ "binaryStringResponseBody": "true" }));
    },
});

// for extensions to correctly appear in intellisense we need to extend the interface
// to do this we extend the modules and need to append the /types to the normal import path
// this has to do with where the file we are extending is located
declare module "@pnp/sp/files/types" {
    /**
     * Returns the instance wrapped by the invokable proxy
     */
    interface IFile {
        getStream(): Promise<IResponseBodyStream>;
    }
}

