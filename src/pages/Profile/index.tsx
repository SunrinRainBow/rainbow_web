import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import MainLayout from "@/components/layout/main";
import Input from "@/components/ui/input";
import Category from "@/components/ui/category";
import { categories } from "@/components/ui/category/data";
import Button from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getMyProfile, updateMyProfile } from "@/api/profile";
import styles from "./styles.module.scss";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      try {
        const profile = await getMyProfile();
        setNickname(profile.nickname || profile.name || "");
        setAge(profile.age?.toString() || "");
        setCountry(profile.country || "");
        setGender(profile.gender || "");
        setSelectedCategories(profile.categories || []);
      } catch (error) {
        console.error("Failed to fetch profile:", error);

        if (user?.name) {
          setNickname(user.name);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user]);

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
      await updateMyProfile({
        nickname,
        age: age ? parseInt(age, 10) : undefined,
        country: country || undefined,
        gender: gender || undefined,
        categories: selectedCategories,
      });
      setMessage({ type: 'success', text: '프로필이 저장되었습니다.' });
    } catch (error) {
      console.error("Failed to save profile:", error);
      setMessage({ type: 'error', text: '프로필 저장에 실패했습니다.' });
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
            <h1 className={styles.title}>프로필 설정</h1>
            <p className={styles.description}>
              나를 소개해주세요. 당신의 취향과 관심사를 알려주시면
              <br />더 정확한 매칭을 도와드릴 수 있습니다.
            </p>

            {user && (
              <div className={styles.user_info_section}>
                <h2 className={styles.section_title}>Google 계정 정보</h2>
                <div className={styles.user_info_card}>
                  <div className={styles.user_avatar_large}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name || "User"} />
                    ) : (
                      <div className={styles.avatar_placeholder_large}>
                        <svg
                          width="64"
                          height="64"
                          viewBox="0 0 64 64"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="32"
                            cy="32"
                            r="32"
                            fill="rgba(255,255,255,0.1)"
                          />
                          <path
                            d="M32 20C27.5817 20 24 23.5817 24 28C24 32.4183 27.5817 36 32 36C36.4183 36 40 32.4183 40 28C40 23.5817 36.4183 20 32 20Z"
                            fill="rgba(255,255,255,0.5)"
                          />
                          <path
                            d="M32 38C25.3726 38 20 41.3726 20 48H44C44 41.3726 38.6274 38 32 38Z"
                            fill="rgba(255,255,255,0.5)"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={styles.user_details}>
                    <div className={styles.user_detail_item}>
                      <span className={styles.user_detail_label}>이름</span>
                      <span className={styles.user_detail_value}>
                        {user.name || "이름 없음"}
                      </span>
                    </div>
                    <div className={styles.user_detail_item}>
                      <span className={styles.user_detail_label}>이메일</span>
                      <span className={styles.user_detail_value}>
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.form}>
              
              <div className={styles.section}>
                <h2 className={styles.section_title}>프로필 사진</h2>
                <div className={styles.avatar_section}>
                  <div className={styles.avatar_placeholder}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name || "User"} />
                    ) : (
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 64 64"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="32"
                          cy="32"
                          r="32"
                          fill="rgba(255,255,255,0.1)"
                        />
                        <path
                          d="M32 20C27.5817 20 24 23.5817 24 28C24 32.4183 27.5817 36 32 36C36.4183 36 40 32.4183 40 28C40 23.5817 36.4183 20 32 20Z"
                          fill="rgba(255,255,255,0.5)"
                        />
                        <path
                          d="M32 38C25.3726 38 20 41.3726 20 48H44C44 41.3726 38.6274 38 32 38Z"
                          fill="rgba(255,255,255,0.5)"
                        />
                      </svg>
                    )}
                  </div>
                  <Button variant="secondary" size="medium">
                    사진 변경
                  </Button>
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.section_title}>기본 정보</h2>
                <div className={styles.form_grid}>
                  <Input
                    label="닉네임"
                    placeholder="닉네임을 입력해주세요"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    fullWidth
                    size="large"
                  />
                  <Input
                    label="나이"
                    placeholder="나이를 입력해주세요"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    fullWidth
                    size="large"
                  />
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.section_title}>국가 및 성별</h2>
                <div className={styles.form_grid}>
                  <div className={styles.select_wrapper}>
                    <label className={styles.select_label}>
                      국가 <span className={styles.required}>*</span>
                    </label>
                    <select
                      className={styles.select}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
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
                    <label className={styles.select_label}>
                      성별 <span className={styles.required}>*</span>
                    </label>
                    <select
                      className={styles.select}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      required
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
                <h2 className={styles.section_title}>내 관심사</h2>
                <p className={styles.section_description}>
                  나의 취향과 관심사를 선택해주세요.
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
                  {isSaving ? '저장 중...' : '프로필 저장'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
