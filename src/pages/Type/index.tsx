import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import MainLayout from "@/components/layout/main";
import Input from "@/components/ui/input";
import Category from "@/components/ui/category";
import { categories } from "@/components/ui/category/data";
import Button from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getMyPreferences, updateMyPreferences } from "@/api/preferences";
import styles from "./styles.module.scss";

export default function Type() {
  const { isAuthenticated } = useAuth();
  const [country, setCountry] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [gender, setGender] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      try {
        const prefs = await getMyPreferences();
        setCountry(prefs.target_country || "");
        setAgeMin(prefs.target_age_min?.toString() || "");
        setAgeMax(prefs.target_age_max?.toString() || "");
        setGender(prefs.target_gender || "");
        setSelectedCategories(prefs.target_categories || []);
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [isAuthenticated]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      await updateMyPreferences({
        target_country: country || undefined,
        target_age_min: ageMin ? parseInt(ageMin, 10) : undefined,
        target_age_max: ageMax ? parseInt(ageMax, 10) : undefined,
        target_gender: gender || undefined,
        target_categories: selectedCategories,
      });
      setMessage({ type: 'success', text: '설정이 저장되었습니다.' });
    } catch (error) {
      console.error("Failed to save preferences:", error);
      setMessage({ type: 'error', text: '설정 저장에 실패했습니다.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Header />
      <MainLayout>
        <div className={styles.container}>
          <div className={styles.content}>
            <h1 className={styles.title}>취향 카테고리 설정</h1>
            <p className={styles.description}>
              만나고 싶은 사람들의 취향을 선택해주세요.
              <br />
              선택한 취향과 비슷한 사람들과 매칭됩니다.
            </p>

            <div className={styles.form}>
              
              <div className={styles.section}>
                <h2 className={styles.section_title}>기본 정보</h2>
                <div className={styles.form_grid}>
                  <Input
                    label="최소 나이"
                    placeholder="최소 나이"
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                    fullWidth
                    size="large"
                  />
                  <Input
                    label="최대 나이"
                    placeholder="최대 나이"
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                    fullWidth
                    size="large"
                  />
                  <div className={styles.select_wrapper}>
                    <label className={styles.select_label}>국가</label>
                    <select
                      className={styles.select}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    >
                      <option value="">선택하지 않음</option>
                      <option value="KR">대한민국</option>
                      <option value="US">미국</option>
                      <option value="JP">일본</option>
                      <option value="CN">중국</option>
                      <option value="GB">영국</option>
                      <option value="FR">프랑스</option>
                      <option value="DE">독일</option>
                      <option value="ES">스페인</option>
                      <option value="IT">이탈리아</option>
                      <option value="CA">캐나다</option>
                      <option value="AU">호주</option>
                      <option value="BR">브라질</option>
                      <option value="MX">멕시코</option>
                      <option value="IN">인도</option>
                      <option value="RU">러시아</option>
                      <option value="OTHER">기타</option>
                    </select>
                  </div>
                  <div className={styles.select_wrapper}>
                    <label className={styles.select_label}>성별</label>
                    <select
                      className={styles.select}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">선택하지 않음</option>
                      <option value="male">남성</option>
                      <option value="female">여성</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.section_title}>취향 카테고리</h2>
                <p className={styles.section_description}>
                  만나고 싶은 사람들의 취향을 선택해주세요.
                </p>
                <Category
                  categories={categories}
                  selectedIds={selectedCategories}
                  onCategoryToggle={handleCategoryToggle}
                />
              </div>

              {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}

              <div className={styles.action_buttons}>
                <Button
                  variant="primary"
                  size="large"
                  onClick={handleSave}
                  fullWidth
                  disabled={isSaving || isLoading}
                >
                  {isSaving ? '저장 중...' : '설정 저장'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
