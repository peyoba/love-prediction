const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const auth = require('../middleware/auth');

// 预测页面
router.get('/', auth, (req, res) => {
    if (!req.user) {
        return res.redirect('/');
    }
    res.render('prediction', {
        title: '契合度预测',
        user: req.user
    });
});

// 提交预测
router.post('/analyze', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const { age, gender, personality, interests, values } = req.body;

        // 更新预测算法
        const calculateCompatibility = (userProfile, partnerInfo) => {
            let score = 0;
            let analysis = [];
            let detailedScores = {};

            // 基础匹配度（30分）
            const baseScore = calculateBaseScore(userProfile, partnerInfo);
            score += baseScore.score;
            detailedScores.base = baseScore;
            analysis.push(baseScore.analysis);

            // 生活方式匹配（25分）
            const lifestyleScore = calculateLifestyleScore(userProfile, partnerInfo);
            score += lifestyleScore.score;
            detailedScores.lifestyle = lifestyleScore;
            analysis.push(lifestyleScore.analysis);

            // 价值观匹配（25分）
            const valueScore = calculateValueScore(userProfile, partnerInfo);
            score += valueScore.score;
            detailedScores.values = valueScore;
            analysis.push(valueScore.analysis);

            // 发展潜力评估（20分）
            const potentialScore = calculatePotentialScore(userProfile, partnerInfo);
            score += potentialScore.score;
            detailedScores.potential = potentialScore;
            analysis.push(potentialScore.analysis);

            // 生成综合分析
            const finalAnalysis = generateDetailedAnalysis(score, detailedScores);

            return {
                score,
                aspects: {
                    base: (baseScore.score / 30) * 100,
                    lifestyle: (lifestyleScore.score / 25) * 100,
                    values: (valueScore.score / 25) * 100,
                    potential: (potentialScore.score / 20) * 100
                },
                detailedScores,
                analysis: finalAnalysis
            };
        };

        // 基础匹配��计算
        function calculateBaseScore(userProfile, partnerInfo) {
            let score = 0;
            let analysis = [];

            // 年龄匹配（15分）
            const ageDiff = Math.abs(userProfile.age - partnerInfo.age);
            let ageScore = 0;
            if (ageDiff <= 3) ageScore = 15;
            else if (ageDiff <= 5) ageScore = 12;
            else if (ageDiff <= 8) ageScore = 8;
            else if (ageDiff <= 10) ageScore = 5;
            else ageScore = 3;
            score += ageScore;
            analysis.push(`年龄差异: ${ageDiff}岁 (${ageScore}/15分)`);

            // 地理位置（10分）
            const locationScore = userProfile.location === partnerInfo.location ? 10 : 5;
            score += locationScore;
            analysis.push(`地理位置: ${locationScore === 10 ? '同城' : '异地'} (${locationScore}/10分)`);

            // 婚恋目标（5分）
            const goalScore = userProfile.marriageGoal === partnerInfo.marriageGoal ? 5 : 2;
            score += goalScore;
            analysis.push(`婚恋目标: ${goalScore === 5 ? '一致' : '不一致'} (${goalScore}/5分)`);

            return {
                score,
                analysis: '基础匹配度分析：\n' + analysis.join('\n')
            };
        }

        // 生活方式匹配度计���
        function calculateLifestyleScore(userProfile, partnerInfo) {
            let score = 0;
            let analysis = [];

            // 工作方式匹配（10分）
            const workScore = userProfile.lifestyle.workStyle === partnerInfo.lifestyle.workStyle ? 10 : 5;
            score += workScore;
            analysis.push(`工作方式: ${workScore === 10 ? '高度匹配' : '存在差异'} (${workScore}/10分)`);

            // 生活习惯匹配（10分）
            const commonHabits = partnerInfo.lifestyle.livingHabits.filter(
                habit => userProfile.lifestyle.livingHabits.includes(habit)
            );
            const habitScore = Math.min(10, commonHabits.length * 2);
            score += habitScore;
            analysis.push(`生活习惯: 共同点${commonHabits.length}个 (${habitScore}/10分)`);

            // 社交方式匹配（5分）
            const socialScore = userProfile.lifestyle.socialStyle === partnerInfo.lifestyle.socialStyle ? 5 : 3;
            score += socialScore;
            analysis.push(`社交方式: ${socialScore === 5 ? '相似' : '互补'} (${socialScore}/5分)`);

            return {
                score,
                analysis: '生活方式匹配分析：\n' + analysis.join('\n')
            };
        }

        // 价值观匹配度计算
        function calculateValueScore(userProfile, partnerInfo) {
            let score = 0;
            let analysis = [];

            // 共同价值观（15分）
            const commonValues = partnerInfo.values.filter(
                value => userProfile.values.includes(value)
            );
            const valueScore = Math.min(15, commonValues.length * 3);
            score += valueScore;
            analysis.push(`共同价值观: ${commonValues.join(', ')} (${valueScore}/15分)`);

            // 教育背景（5分）
            const educationScore = userProfile.education === partnerInfo.education ? 5 : 3;
            score += educationScore;
            analysis.push(`教育背景: ${educationScore === 5 ? '相同' : '不同'} (${educationScore}/5分)`);

            // 事业发展（5分）
            const incomeMatch = Math.abs(
                getIncomeLevel(userProfile.income) - getIncomeLevel(partnerInfo.income)
            );
            const incomeScore = incomeMatch <= 1 ? 5 : (incomeMatch <= 2 ? 3 : 1);
            score += incomeScore;
            analysis.push(`收入水平匹配: ${getIncomeDescription(incomeMatch)} (${incomeScore}/5分)`);

            return {
                score,
                analysis: '价值观匹配分析：\n' + analysis.join('\n')
            };
        }

        // 发展潜力评估
        function calculatePotentialScore(userProfile, partnerInfo) {
            let score = 0;
            let analysis = [];

            // 职业发展（8分）
            const occupationScore = calculateOccupationCompatibility(
                userProfile.occupation,
                partnerInfo.occupation
            );
            score += occupationScore;
            analysis.push(`职业发展: ${getOccupationAnalysis(occupationScore)} (${occupationScore}/8分)`);

            // 生活目标（7分）
            const goalScore = calculateGoalCompatibility(
                userProfile.marriageGoal,
                partnerInfo.marriageGoal
            );
            score += goalScore;
            analysis.push(`生活目标: ${getGoalAnalysis(goalScore)} (${goalScore}/7分)`);

            // 成长空间（5分）
            const growthScore = calculateGrowthPotential(userProfile, partnerInfo);
            score += growthScore;
            analysis.push(`成长空间: ${getGrowthAnalysis(growthScore)} (${growthScore}/5分)`);

            return {
                score,
                analysis: '发展潜力分析：\n' + analysis.join('\n')
            };
        }

        // 辅助函数
        function getIncomeLevel(income) {
            const levels = {
                '0-5k': 1,
                '5k-10k': 2,
                '10k-20k': 3,
                '20k-50k': 4,
                '50k+': 5
            };
            return levels[income] || 1;
        }

        function getIncomeDescription(diff) {
            if (diff === 0) return '完全匹配';
            if (diff === 1) return '接近';
            if (diff === 2) return '有差距';
            return '差距较大';
        }

        function calculateOccupationCompatibility(occupation1, occupation2) {
            // 这里可以添加更复杂的职业匹配逻辑
            if (occupation1 === occupation2) return 8;
            return 5;
        }

        function getOccupationAnalysis(score) {
            if (score === 8) return '职业高度匹配';
            return '职业领域不同但互补';
        }

        function calculateGoalCompatibility(goal1, goal2) {
            if (goal1 === goal2) return 7;
            if (goal1 === '未定' || goal2 === '未定') return 4;
            return 2;
        }

        function getGoalAnalysis(score) {
            if (score === 7) return '目标一致';
            if (score === 4) return '目标可调整';
            return '目标存在差异';
        }

        function calculateGrowthPotential(userProfile, partnerInfo) {
            // 可以基于教育、职业、兴趣等多个维度评估成长潜力
            let score = 0;
            
            // 教育程度差异带来的成长空间
            if (userProfile.education !== partnerInfo.education) score += 2;
            
            // 兴趣爱好的互补性
            const commonInterests = partnerInfo.interests.filter(
                i => userProfile.interests.includes(i)
            );
            if (commonInterests.length > 0 && commonInterests.length < 3) score += 2;
            
            // 性格互补
            if (userProfile.personality !== partnerInfo.personality) score += 1;
            
            return score;
        }

        function getGrowthAnalysis(score) {
            if (score >= 4) return '成长空间充足';
            if (score >= 2) return '有一定成长空间';
            return '需要主动创造成长机会';
        }

        // 生成详细分析报告
        function generateDetailedAnalysis(totalScore, detailedScores) {
            let analysis = `综合契合度分析报告\n\n`;
            
            // 添加各维度分析
            Object.values(detailedScores).forEach(score => {
                analysis += score.analysis + '\n\n';
            });

            // 添加总结和建议
            analysis += '总结与建议：\n';
            if (totalScore >= 85) {
                analysis += '你们的整体契合度非常高！在多个维度都展现出了良好的匹配度。建议：\n';
                analysis += '1. 保持真诚的沟通和交流\n';
                analysis += '2. 继续发展和深入了解对方\n';
                analysis += '3. 注意维护和经营感情\n';
            } else if (totalScore >= 70) {
                analysis += '你们有不错的契合基础，在某些方面特别匹配。建议：\n';
                analysis += '1. 关注彼此的差异点，寻求理解和包容\n';
                analysis += '2. 在共同兴趣方面多互动\n';
                analysis += '3. 保持开放和积极的心态\n';
            } else if (totalScore >= 50) {
                analysis += '你们存在一定的契合点，但也有较多需要磨合的地方。建议：\n';
                analysis += '1. 多沟通，了解彼此的想法和需求\n';
                analysis += '2. 尊重差异，寻找平衡点\n';
                analysis += '3. 给彼此一些时间和空间\n';
            } else {
                analysis += '你们的契合度较低，可能需要更多的了解和沟通。建议：\n';
                analysis += '1. 认真思考是否适合继续发展\n';
                analysis += '2. 如果决定继续，需要投入更多耐心\n';
                analysis += '3. 寻找可能的共同点和成长空间\n';
            }

            return analysis;
        }

        const compatibility = calculateCompatibility(req.user.profile, {
            age, gender, personality, interests, values
        });

        const prediction = new Prediction({
            user: req.user._id,
            partnerInfo: {
                age,
                gender,
                personality,
                interests,
                values
            },
            compatibility
        });

        await prediction.save();

        res.json({
            success: true,
            prediction
        });
    } catch (error) {
        console.error('预测错误:', error);
        res.status(500).json({ error: '预测失败，请稍后重试' });
    }
});

// 获取预测历史
router.get('/history', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const predictions = await Prediction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(predictions);
    } catch (error) {
        console.error('获取预测历史错误:', error);
        res.status(500).json({ error: '获取历史记录失败' });
    }
});

module.exports = router; 