declare namespace ABT {
    type Bibliography = Array<{ id: string; html: string }>;

    type CitationTypes = Array<{
        label: string;
        value: string;
    }>;

    type LinkStyle = 'always' | 'always-full-surround' | 'urls' | 'never';

    interface BibOptions {
        /** Heading options */
        heading: string;
        /** HTML Heading element preferred for heading */
        headingLevel: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        /** Should the heading be toggleable? */
        style: 'fixed' | 'toggle';
    }

    interface ExternalSiteMeta {
        authors: Array<{
            firstname: string;
            lastname: string;
        }>;
        article: {
            /* Facebook URL - not name */
            author?: string;
            /* ISO Date String */
            modified_time?: string;
            /* ISO Date String */
            published_time?: string;
            /* Facebook URL */
            publisher?: string;
            /* Category or section of source */
            section?: string;
            /* CSV list of tags */
            tag?: string;
        };
        /* Published Date ISO string */
        issued?: string;
        og: {
            /* Article description */
            description?: string;
            /* Height of main image in px */
            image_height?: string;
            /* Width of main image in px */
            image_width?: string;
            /* urlencoded image url */
            image?: string;
            /* Site locale */
            locale?: string;
            /* ISO Date String */
            pubdate?: string;
            /* Clean URL form of site (e.g. `social.techcrunch.com`) */
            site?: string;
            /* Title of website */
            site_name?: string;
            /* Title of Article */
            title?: string;
            /* Type of posting (generally article) */
            type?: string; // tslint:disable-line
            /* ISO Date String */
            updated_time?: string;
            /* URL of page */
            url?: string;
        };
        sailthru: {
            /* _usually_ is `firstname lastname` */
            author?: string;
            /* ISO Date String (issued) */
            date?: string;
            /* Article description */
            description?: string;
            /* Full-size image URL */
            image_full?: string;
            /* Thumbnail image URL */
            image_thumb?: string;
            /* CSV list of tags */
            tags?: string;
            /* Title of Article */
            title?: string;
        };
        /* Title of Article - last resort */
        title?: string;
        /* URL of page */
        url?: string;
    }

    interface Field {
        value: string;
        label: string;
        required: boolean;
        pattern: string;
        placeholder: string;
    }

    interface FieldMap {
        title: string;
        fields: Field[];
        people: Array<{
            label: string;
            type:
                | 'author'
                | 'container-author'
                | 'editor'
                | 'director'
                | 'interviewer'
                | 'illustrator'
                | 'composer'
                | 'translator'
                | 'recipient'
                | 'collection-editor';
        }>;
    }

    interface FieldMappings {
        bill: FieldMap;
        book: FieldMap;
        chapter: FieldMap;
        legal_case: FieldMap;
        'paper-conference': FieldMap;
        'entry-encyclopedia': FieldMap;
        motion_picture: FieldMap;
        speech: FieldMap;
        article: FieldMap;
        'article-journal': FieldMap;
        'article-magazine': FieldMap;
        'article-newspaper': FieldMap;
        patent: FieldMap;
        report: FieldMap;
        legislation: FieldMap;
        thesis: FieldMap;
        broadcast: FieldMap;
        webpage: FieldMap;
    }

    interface ManualData {
        manualData: CSL.Data;
        people: CSL.TypedPerson[];
    }

    interface ReferenceWindowPayload extends ManualData {
        addManually: boolean;
        attachInline: boolean;
        identifierList: string;
    }
}
