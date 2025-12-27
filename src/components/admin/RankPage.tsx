'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiMenu, FiStar, FiTrendingUp, FiAward } from 'react-icons/fi';

interface Shop {
  _id: string;
  name: string;
  isFeatured: boolean;
  isTrending: boolean;
  isSponsored: boolean;
}

const shops: Shop[] = [
  { _id: '1', name: 'Shop A', isFeatured: true, isTrending: false, isSponsored: false },
  { _id: '2', name: 'Shop B', isFeatured: false, isTrending: true, isSponsored: false },
  { _id: '3', name: 'Shop C', isFeatured: false, isTrending: false, isSponsored: true },
];

function SortableShop({ shop }: { shop: Shop }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: shop._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <FiMenu className="text-gray-400 text-xl" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{shop.name}</h4>
            <div className="flex gap-2 mt-2">
              {shop.isFeatured && (
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-xs flex items-center gap-1">
                  <FiStar />
                  Featured
                </span>
              )}
              {shop.isTrending && (
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded text-xs flex items-center gap-1">
                  <FiTrendingUp />
                  Trending
                </span>
              )}
              {shop.isSponsored && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs flex items-center gap-1">
                  <FiAward />
                  Sponsored
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-sm">
            Edit
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function RankPage() {
  const [shopList, setShopList] = useState(shops);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setShopList((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rank & Featured System</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Drag shops to reorder and mark as Featured, Trending, or Sponsored</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={shopList.map((s) => s._id)} strategy={verticalListSortingStrategy}>
            {shopList.map((shop) => (
              <SortableShop key={shop._id} shop={shop} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

