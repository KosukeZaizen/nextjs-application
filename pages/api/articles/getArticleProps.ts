import { getImgNumber } from "../../../components/articles/Layout";
import { fetchZAppsFromServerSide } from "../../../lib/fetch";
import { apiGet } from "../../../lib/nextApi";
import { GetParams } from "../../../types/next";
import { domain, siteName } from "../../../components/articles/Home";
import { Page, Props } from "../../articles/[[...path]]";

export interface GetArticleProps {
    url: "/api/articles/getArticleProps";
    params: Params;
    response: Response;
}
type Params = { pageName: string };
type Response = Props;

const handler = async ({ pageName }: GetParams<Params>): Promise<Response> => {
    if (typeof pageName !== "string") {
        throw new Error();
    }
    return await getArticleProps(pageName);
};

export default apiGet<GetArticleProps>(handler);

export async function getArticleProps(pageName: string): Promise<Props> {
    // Article
    const page: Page = await (
        await fetchZAppsFromServerSide(`api/Articles/GetArticle?p=${pageName}`)
    ).json();

    const {
        url,
        description,
        title,
        isAboutFolktale,
        articleContent,
        imgPath,
        authorId,
    } = page;

    const authorPromise = fetchZAppsFromServerSide(
        "api/Articles/GetAllAuthors"
    );

    const indexInfo = makeIndexInfo(articleContent);

    // Other articles
    const param = `?num=1000&${isAboutFolktale ? "&isAboutFolktale=true" : ""}`;
    const articles: Page[] = await (
        await fetchZAppsFromServerSide("api/Articles/GetRandomArticles" + param)
    ).json();

    const otherArticles = articles.filter(a => a.title !== title);

    return {
        pageType: "article",
        pageName,
        url,
        description,
        title,
        isAboutFolktale,
        articleContent,
        imgPath,
        indexInfo,
        otherArticles,
        imgNumber: [2, 3].includes(authorId) // woman authors
            ? 3
            : getImgNumber(pageName.length),
        authorId,
        allAuthors: await (await authorPromise).json(),
        helmetProps: {
            title,
            desc: description,
            domain,
            ogImg: imgPath,
            siteName,
        },
    };
}

export function makeIndexInfo(articleContent?: string) {
    return articleContent
        ? articleContent
              .split("\n")
              .filter(c => c.includes("##") && !c.includes("###"))
              .map(c => {
                  const linkText = c.split("#").join("").trim();
                  const encodedUrl = encodeURIComponent(linkText);
                  return { linkText, encodedUrl };
              })
        : [];
}
