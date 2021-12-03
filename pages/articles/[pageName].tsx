import { css } from "@emotion/react";
import {
    GetStaticPaths,
    GetStaticPropsContext,
    GetStaticPropsResult,
} from "next";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ArticlesList } from "../../components/articles/ArticlesList";
import { Author } from "../../components/articles/Author";
import {
    h1TitleCss,
    Layout,
    whiteShadowStyle,
} from "../../components/articles/Layout";
import { Markdown } from "../../components/articles/Markdown";
import {
    FBShareBtn,
    TwitterShareBtn,
} from "../../components/articles/SnsShareButton";
import CharacterComment from "../../components/shared/CharacterComment";
import FB from "../../components/shared/FaceBook";
import { HelmetProps } from "../../components/shared/Helmet";
import { ScrollBox } from "../../components/shared/ScrollBox";
import { YouTubeAd } from "../../components/shared/YouTubeAd";
import { Z_APPS_TOP_URL } from "../../const/public";
import { fetchGet, fetchZAppsFromServerSide } from "../../lib/fetch";
import { useHashScroll } from "../../lib/hooks/useHashScroll";
import { useIsFirstRender } from "../../lib/hooks/useIsFirstRender";
import { useScreenSize } from "../../lib/screenSize";
import { sleepAsync } from "../../lib/sleep";
import {
    getArticleProps,
    GetArticleProps,
} from "../api/articles/getArticleProps";

export interface Page {
    url?: string;
    title: string;
    description: string;
    articleContent: string;
    imgPath?: string;
    isAboutFolktale?: boolean;
}

export type IndexInfo = {
    linkText: string;
    encodedUrl: string;
}[];

export interface Props extends Page {
    indexInfo: IndexInfo;
    otherArticles: Page[];
    imgNumber: number;
    pageName: string;
    helmetProps: HelmetProps;
}

export default function Articles(props: Props) {
    const { screenWidth, screenHeight } = useScreenSize();

    const {
        title,
        description,
        articleContent,
        indexInfo,
        otherArticles,
        imgNumber,
        pageName,
        helmetProps,
    } = useRevisedProps(props);

    return (
        <Layout
            screenWidth={screenWidth}
            screenHeight={screenHeight}
            helmetProps={helmetProps}
        >
            <ArticleContent
                title={title}
                description={description}
                width={screenWidth}
                content={articleContent}
                // adsense={true}
                otherArticles={otherArticles}
                indexInfo={indexInfo}
                imgNumber={imgNumber}
                pageName={pageName}
            />
        </Layout>
    );
}

function useRevisedProps(props: Props) {
    const [_props, setProps] = useState<Props>(props);

    useEffect(() => {
        (async () => {
            await sleepAsync(200);
            const result = await fetchGet<GetArticleProps>(
                "/api/articles/getArticleProps",
                {
                    pageName: props.pageName,
                }
            );
            if (result.responseType === "success") {
                setProps(result);
            }
        })();
    }, [props.pageName]);

    return _props;
}

// export const excludedArticleTitles = ["Kamikaze"];
export const excludedArticleTitles = [];

// 0 から 4.9 まで 0.1 刻み
const textShadow = Array.from(Array(50).keys())
    .map(n => `0 0 ${n / 10}px white`)
    .join(",");

interface ArticleContentProps {
    title: string;
    description: string;
    width: number;
    indexInfo: IndexInfo;
    content: string;
    // adsense: boolean;
    otherArticles: Page[];
    imgNumber: number;
    pageName: string;
}
export function ArticleContent({
    title,
    description,
    width,
    indexInfo,
    content,
    otherArticles,
    imgNumber,
    pageName,
}: ArticleContentProps) {
    const isWide = width > 991;

    const { isFirstRender } = useIsFirstRender();
    useHashScroll(isFirstRender);

    return (
        <main css={mainCss}>
            <BreadCrumbs title={title} />
            <article css={articleCss}>
                <h1 css={h1TitleCss}>{title}</h1>

                <CharacterComment
                    imgNumber={imgNumber}
                    screenWidth={width}
                    comment={description}
                    css={characterCommentCss}
                    commentStyle={commentCss}
                    loading="noTime"
                />

                <IndexAndAd isWide={isWide} indexInfo={indexInfo} />

                <Markdown source={content} style={markdownStyle} />
            </article>

            <CharacterComment
                comment={
                    <>
                        <p>{"If you like this article, please share!"}</p>
                        <FBShareBtn
                            urlToShare={`${Z_APPS_TOP_URL}/articles/${pageName}`}
                            imgStyle={fbButtonStyle}
                            containerStyle={snsButtonContainerStyle}
                        />
                        <TwitterShareBtn
                            urlToShare={`${Z_APPS_TOP_URL}/articles/${pageName}`}
                            textToShare={title}
                            imgStyle={twitterButtonStyle}
                            containerStyle={snsButtonContainerStyle}
                        />
                    </>
                }
                imgNumber={(imgNumber - 1 || 3) - 1 || 3}
                screenWidth={width}
                loading="noTime"
            />
            <hr />
            <Author style={AuthorStyle} screenWidth={width} />
            <hr />
            {otherArticles.length > 0 && (
                <section>
                    <h2 css={h2Style}>More Articles</h2>
                    <ArticlesList
                        titleH={"h3"}
                        articles={otherArticles}
                        screenWidth={width}
                    />
                </section>
            )}
            <hr />
            <FB style={fbStyle} screenWidth={width} />
        </main>
    );
}

const fbStyle = css({ textAlign: "center" });

const AuthorStyle = css({ marginTop: 45 });

const fbButtonStyle = css({
    width: 200,
    marginTop: 15,
});

const twitterButtonStyle = css({
    width: 200,
    marginTop: 5,
});

const snsButtonContainerStyle = css({
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
});

const h2Style = css`
    margin: 55px 0 55px;
    padding: 20px;
    color: white;
    background: linear-gradient(to top, #035c1d, #047c28);
    border-radius: 5px;
    text-align: center;
`;

function BreadCrumbs({ title }: { title: string }) {
    return (
        <div
            itemScope
            itemType="https://schema.org/BreadcrumbList"
            css={breadCrumbsContainerCss}
        >
            <span
                itemProp="itemListElement"
                itemScope
                itemType="http://schema.org/ListItem"
            >
                <Link href="/articles">
                    <a itemProp="item" css={breadCrumbsCss}>
                        <span itemProp="name">{"Home"}</span>
                    </a>
                </Link>
                <meta itemProp="position" content="1" />
            </span>
            {" > "}
            <span
                itemProp="itemListElement"
                itemScope
                itemType="http://schema.org/ListItem"
            >
                <span itemProp="name" css={breadCrumbsCss}>
                    {title}
                </span>
                <meta itemProp="position" content="2" />
            </span>
        </div>
    );
}

function IndexAndAd({
    isWide,
    indexInfo,
}: {
    isWide: boolean;
    indexInfo: IndexInfo;
}) {
    return (
        <div
            css={{
                display: "flex",
                flexDirection: isWide ? "row" : "column",
                position: "relative",
                top: 15,
            }}
        >
            <ScrollBox
                pCss={css({
                    display: "inline-block",
                    flex: 1,
                    marginRight: isWide ? 30 : undefined,
                })}
            >
                <div css={indexContainerCss}>
                    <span css={indexTitleCss}>Index</span>
                    <ol css={indexOlCss}>
                        {indexInfo.map(ind => (
                            <li key={ind.linkText} css={indexLiCss}>
                                <a href={`#${ind.encodedUrl}`}>
                                    {ind.linkText}
                                </a>
                            </li>
                        ))}
                    </ol>
                </div>
            </ScrollBox>
            {isWide && (
                <div css={adStyle}>
                    <YouTubeAd width="90%" />
                </div>
            )}
        </div>
    );
}

const adStyle = {
    flex: 1,
    display: "flex",
    alignItems: "center",
};

export const getStaticPaths: GetStaticPaths = async () => {
    const response: Response = await fetchZAppsFromServerSide(
        "api/Articles/GetAllArticles"
    );
    const pages: Page[] = await response.json();
    const paths: string[] = pages
        .map(p => p.url?.toLowerCase())
        .filter(u => u)
        .map(u => `/articles/${u}`);
    return {
        paths,
        fallback: "blocking",
    };
};

export const getStaticProps = async ({
    params,
}: GetStaticPropsContext<{ pageName: string }>): Promise<
    GetStaticPropsResult<Props>
> => {
    try {
        const pageName = params?.pageName;
        if (!pageName) {
            return { notFound: true, revalidate: 5 };
        }

        // Redirect to lower case
        const lowerPageName = pageName.toLowerCase();
        if (pageName !== lowerPageName) {
            return {
                redirect: {
                    permanent: true,
                    destination: lowerPageName,
                },
            };
        }

        // generate props
        const props = await getArticleProps(pageName);
        if (!props) {
            return { notFound: true, revalidate: 5 };
        }

        return {
            props,
            revalidate: 5,
        };
    } catch {
        return { notFound: true, revalidate: 5 };
    }
};

const mainCss = css`
    max-width: 900px;
    overflow-x: hidden;
`;

const articleCss = css`
    text-align: left;
`;

const indexContainerCss = css`
    font-size: large;
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const indexLiCss = css`
    margin-top: 10px;
    margin-bottom: 5px;
`;

const indexOlCss = css`
    display: inline-block;
    margin: 0;
`;

const indexTitleCss = css`
    font-weight: bold;
    font-size: large;
    margin-left: auto;
    margin-right: auto;
`;

const breadCrumbsContainerCss = css`
    text-align: left;
    ${whiteShadowStyle}
`;

const breadCrumbsCss = css`
    margin-right: 5px;
    margin-left: 5px;
`;

const markdownStyle = {
    margin: "25px 0 40px",
    textShadow,
};

const characterCommentCss = css`
    margin-bottom: 15px;
`;

const commentCss = css`
    padding-left: 25px;
    padding-right: 20px;
`;
