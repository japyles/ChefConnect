import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface RecipeCardProps {
  id: string;
  name: string;
  description: string;
  recipeCount: number;
  coverImage: string;
}

const variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: { opacity: 0, scale: 0.8 },
};

export function RecipeCard({
  id,
  name,
  description,
  recipeCount,
  coverImage,
}: RecipeCardProps) {
  return (
    <motion.div
      layout
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
    >
      <Link
        href={`/collections/${id}`}
        className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="aspect-[16/9] overflow-hidden">
          <Image
            src={coverImage}
            alt={name}
            width={400}
            height={225}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="mb-1 text-lg font-semibold text-gray-900">{name}</h3>
          <p className="mb-4 text-sm text-gray-600 line-clamp-2">{description}</p>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <BookOpen className="h-4 w-4" />
            <span>{recipeCount} recipes</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
