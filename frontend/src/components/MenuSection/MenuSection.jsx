import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaFire, FaEdit, FaPlus } from 'react-icons/fa';
import { menuItemAPI } from '../../services/api';
import MenuItemModal from './MenuItemModal';
import styles from './MenuSection.module.css';

const BACKEND_URL = 'http://localhost:3000';

const MenuSection = ({ restaurantId, isOwner }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [zoomedItem, setZoomedItem] = useState(null);
    const [zoomedIndex, setZoomedIndex] = useState(0);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const scrollRef = useRef(null);

    // Helper để lấy full URL cho ảnh
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        return `${BACKEND_URL}${url}`;
    };

    // Load menu items
    const loadMenu = useCallback(async () => {
        if (!restaurantId) return;

        setLoading(true);
        try {
            const response = await menuItemAPI.getMenuByRestaurant(restaurantId);
            if (response.success) {
                setMenuItems(response.data || []);
            }
        } catch (error) {
            console.error('Error loading menu:', error);
        } finally {
            setLoading(false);
        }
    }, [restaurantId]);

    useEffect(() => {
        loadMenu();
    }, [loadMenu]);

    // Navigation handlers - Chuyển sang dùng scroll thay vì slice
    const handlePrev = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const handleNext = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    // Zoom handlers
    const openZoom = (item, index) => {
        setZoomedItem(item);
        setZoomedIndex(index);
    };

    const closeZoom = () => {
        setZoomedItem(null);
    };

    const zoomPrev = (e) => {
        e.stopPropagation();
        const newIndex = zoomedIndex > 0 ? zoomedIndex - 1 : menuItems.length - 1;
        setZoomedIndex(newIndex);
        setZoomedItem(menuItems[newIndex]);
    };

    const zoomNext = (e) => {
        e.stopPropagation();
        const newIndex = zoomedIndex < menuItems.length - 1 ? zoomedIndex + 1 : 0;
        setZoomedIndex(newIndex);
        setZoomedItem(menuItems[newIndex]);
    };

    // Editing handlers
    const handleEditStart = (e, item) => {
        e.stopPropagation();
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleAddStart = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleModalSuccess = (action) => {
        loadMenu();
    };

    // Keyboard navigation for zoom
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!zoomedItem) return;
            if (e.key === 'Escape') closeZoom();
            if (e.key === 'ArrowLeft') zoomPrev(e);
            if (e.key === 'ArrowRight') zoomNext(e);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomedItem, zoomedIndex, menuItems]);

    // Loading state handling
    if (loading && menuItems.length === 0) {
        return (
            <section className={styles.menuSection}>
                <div className={styles.sectionHeader}>
                    <h4>Menu của nhà hàng</h4>
                </div>
                <div className={styles.loading}>Đang tải menu...</div>
            </section>
        );
    }

    if (menuItems.length === 0 && !isOwner) {
        return null;
    }

    return (
        <section className={styles.menuSection}>
            <div className={styles.sectionHeader}>
                <h4>Menu của nhà hàng</h4>
                {menuItems.length > 0 && <span>{menuItems.length} món</span>}
            </div>

            {/* Menu Grid/Carousel */}
            <div className={styles.menuContainer}>
                {!showAll && menuItems.length > 2 && (
                    <>
                        <button
                            className={`${styles.navButton} ${styles.navPrev}`}
                            onClick={handlePrev}
                            aria-label="Previous"
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            className={`${styles.navButton} ${styles.navNext}`}
                            onClick={handleNext}
                            aria-label="Next"
                        >
                            <FaChevronRight />
                        </button>
                    </>
                )}

                <div
                    ref={scrollRef}
                    className={`${styles.menuGrid} ${showAll ? styles.menuGridExpanded : ''}`}
                >
                    {menuItems.map((item, idx) => (
                        <div
                            key={item.id}
                            className={styles.menuCard}
                            onClick={() => openZoom(item, idx)}
                        >
                            <div className={styles.menuImageWrapper}>
                                {item.imageUrl ? (
                                    <img
                                        src={getImageUrl(item.imageUrl)}
                                        alt={item.name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className={styles.noImage}>🍽️</div>
                                )}

                                {/* Badges */}
                                <div className={styles.badgesContainer}>
                                    {item.isPopular && (
                                        <span className={styles.popularBadge}>
                                            <FaFire /> Popular
                                        </span>
                                    )}
                                    {isOwner && item.status === 'pending_approval' && (
                                        <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                                            Chờ duyệt
                                        </span>
                                    )}
                                    {isOwner && item.status === 'rejected' && (
                                        <span className={`${styles.statusBadge} ${styles.statusRejected}`}>
                                            Từ chối
                                        </span>
                                    )}
                                </div>

                                {/* Edit Button for Owner */}
                                {isOwner && (
                                    <button
                                        className={styles.editButton}
                                        onClick={(e) => handleEditStart(e, item)}
                                        title="Sửa món ăn"
                                    >
                                        <FaEdit />
                                    </button>
                                )}

                                <div className={styles.menuOverlay}>
                                    <span className={styles.menuName}>{item.name}</span>
                                </div>
                            </div>
                            <div className={styles.menuInfo}>
                                <span className={styles.menuPrice}>{item.priceFormatted}</span>
                                <span className={styles.menuCategory}>{item.categoryLabel}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {menuItems.length === 0 && isOwner && (
                    <div className={styles.emptyState}>
                        <p>Menu đang trống. Hãy thêm món ăn đầu tiên!</p>
                    </div>
                )}
            </div>

            {/* See More Button */}
            {menuItems.length > 3 && (
                <button
                    className={styles.seeMoreButton}
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? 'Thu gọn' : 'Xem thêm'}
                </button>
            )}

            {/* Add Menu Button for Owner */}
            {isOwner && (
                <button
                    className={styles.addMenuButton}
                    onClick={handleAddStart}
                >
                    <FaPlus /> Thêm món mới
                </button>
            )}

            {/* Detail View Modal (User) */}
            <MenuItemModal
                isOpen={!!zoomedItem}
                onClose={closeZoom}
                item={zoomedItem}
                restaurantId={restaurantId}
                isViewOnly={true}
                onPrev={zoomPrev}
                onNext={zoomNext}
            />

            {/* Add/Edit Modal (Owner) */}
            <MenuItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={editingItem}
                restaurantId={restaurantId}
                onSuccess={handleModalSuccess}
            />
        </section>
    );
};

export default MenuSection;
