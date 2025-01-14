"use client";
import { createOpinion, fetchDiscussionById } from "@/shared/services";
import { useAppSelector } from "@/shared/store/store";
import { Discussion, Role } from "@/types";
import React, { useEffect } from "react";
import { Button, Label, Textarea } from "../ui";
import { Comments } from "./comments";
import { cn } from "@/shared/lib/utils";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface DiscussionArticleProps {
  id: string;
  className?: string;
}

const DiscussionArticle: React.FC<DiscussionArticleProps> = ({
  id,
  className,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setError] = React.useState(false);
  const [discussion, setDiscussion] = React.useState<Discussion>();
  const [comment, setComment] = React.useState("");
  const { currentUser } = useAppSelector((state) => state.user);

  const handleComment = async () => {
    try {
      setIsLoading(true);
      setError(false);
      if (comment.trim().length == 0) return;
      await createOpinion({ discussionId: id, content: comment });
    } catch (err: unknown) {
      console.log(err);
      setError(true);
    } finally {
      setComment("");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getDiscussion = async () => {
      try {
        setIsLoading(true);
        const res = await fetchDiscussionById(id);
        if (res.statusCode !== 200) {
          setError(true);
        } else {
          setDiscussion(res.data);
          setError(false);
        }
      } catch (err: unknown) {
        console.log(err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    getDiscussion();
  }, [id]);
  return (
    <div className={cn("w-full", className)}>
      {isLoading && <Loader2 className="animate-spin mx-auto my-5" size={40} />}
      {isError && !isLoading && <h2>Сталась помилка, спробуйте ще раз</h2>}
      {!isLoading && !isError && discussion && (
        <>
          <div className="flex flex-col items-start justify-between gap-2 max-sm:px-2 px-4 mb-5">
            <h1 className="text-3xl font-bold  my-5">{discussion.title}</h1>

            <p className="text-sm  min-sm:self-end">
              Дата публікації:{" "}
              {new Date(discussion.createdAt).toLocaleDateString()}
            </p>
          </div>

          {discussion.content ? (
            <div
              className="description-content"
              dangerouslySetInnerHTML={{ __html: discussion.content }}
            />
          ) : (
            <p className="text-lg mb-5 ml-2">Немає опису..</p>
          )}
          {(currentUser?.role === Role.ADMIN ||
            currentUser?.id === discussion.author.id) && (
            <Link
              className="block p-1  bg-accent rounded-xl  text-center cursor-pointer text-lg hover:opacity-75 transition-all duration-100"
              href={`/discussions/${id}/edit`}
            >
              Редагувати
            </Link>
          )}
          <div className="bg-text h-[1px] w-full mb-2 mt-9"></div>
          {currentUser?.id ? (
            <>
              <div className="glass-2 m-5 p-2 rounded-xl">
                <Label className="text-xl  ml-2" htmlFor="new-comment">
                  Ваш коментар
                </Label>

                <Textarea
                  id="new-comment"
                  placeholder="Введіть ваш коментар...."
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className=" h-24 rounded-xl bg-transparent resize-none mb-3 text-sm placeholder:opacity-55 "
                />
                <Button
                  onClick={handleComment}
                  className="w-full bg-accent  rounded-xl "
                >
                  Надіслати
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-center">
              Тільки зареєстровані користувачі можуть коментувати😮
            </p>
          )}
          <div className="bg-text h-[1px] w-full my-2 "></div>
          <Comments comments={discussion.opinions} author={currentUser?.id} />
        </>
      )}
    </div>
  );
};

export { DiscussionArticle };
