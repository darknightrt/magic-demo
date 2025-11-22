"use client";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DeepSeekLogo from "@/components/ai/icon/IconDeepseek";
import IconDoubao from "@/components/ai/icon/IconDoubao";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { cn } from "@/lib/utils";
import IconOpenAi from "@/components/ai/icon/IconOpenAi";

const AISettingsPage = () => {
  const t = useTranslations();
  const locale = useLocale();
  
  const {
    doubaoApiKey,
    doubaoModelId,
    deepseekApiKey,
    openaiApiKey,
    openaiModelId,
    openaiApiEndpoint,
    setDoubaoApiKey,
    setDoubaoModelId,
    setDeepseekApiKey,
    setOpenaiApiKey,
    setOpenaiModelId,
    setOpenaiApiEndpoint,
    selectedModel,
    setSelectedModel
  } = useAIConfigStore();

  const [currentModel, setCurrentModel] = useState(selectedModel || "deepseek");

  useEffect(() => {
    if (selectedModel) {
      setCurrentModel(selectedModel);
    } else if (!currentModel) {
      setCurrentModel("deepseek");
    }
  }, [selectedModel]);

  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    // 验证是否选择了模型
    if (!currentModel) {
      toast.error(t("dashboard.settings.ai.testFailed") + ": " + t("dashboard.settings.ai.selectModel"));
      return;
    }

    setIsTesting(true);
    try {
      const modelType = currentModel as "doubao" | "deepseek" | "openai";
      const apiKey =
        modelType === "doubao"
          ? doubaoApiKey
          : modelType === "openai"
          ? openaiApiKey
          : deepseekApiKey;
      const model =
        modelType === "doubao"
          ? doubaoModelId
          : modelType === "openai"
          ? openaiModelId
          : "";
      const apiEndpoint = modelType === "openai" ? openaiApiEndpoint : "";

      // 验证必需字段
      const requiredText = locale === "zh" ? "不能为空" : "is required";
      
      if (!apiKey) {
        toast.error(`${t("dashboard.settings.ai.testFailed")}: ${t(`dashboard.settings.ai.${modelType}.apiKey`)} ${requiredText}`);
        setIsTesting(false);
        return;
      }

      if (modelType === "doubao" && !model) {
        toast.error(`${t("dashboard.settings.ai.testFailed")}: ${t("dashboard.settings.ai.doubao.modelId")} ${requiredText}`);
        setIsTesting(false);
        return;
      }

      if (modelType === "openai" && !model) {
        toast.error(`${t("dashboard.settings.ai.testFailed")}: ${t("dashboard.settings.ai.openai.modelId")} ${requiredText}`);
        setIsTesting(false);
        return;
      }

      if (modelType === "openai" && !apiEndpoint) {
        toast.error(`${t("dashboard.settings.ai.testFailed")}: ${t("dashboard.settings.ai.openai.apiEndpoint")} ${requiredText}`);
        setIsTesting(false);
        return;
      }

      const res = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          model,
          content: "ping",
          modelType,
          apiEndpoint
        })
      });

      // 尝试解析响应
      let data;
      try {
        const text = await res.text();
        if (!text) {
          throw new Error("Empty response");
        }
        data = JSON.parse(text);
      } catch (parseError) {
        // 如果解析失败，可能是 HTML 错误页面（如 Cloudflare 错误）
        console.error("Failed to parse response:", parseError);
        const errorMsg = locale === "zh" 
          ? "服务器响应无效，请检查 API 端点 URL"
          : "Invalid response from server. Please check your API endpoint.";
        toast.error(`${t("dashboard.settings.ai.testFailed")}: ${errorMsg}`);
        setIsTesting(false);
        return;
      }

      if (res.ok && data.success) {
        toast.success(t("dashboard.settings.ai.testSuccess"));
      } else {
        const errorMsg = data.error || `HTTP ${res.status}: ${res.statusText}`;
        toast.error(
          `${t("dashboard.settings.ai.testFailed")}: ${errorMsg}`
        );
      }
    } catch (e: any) {
      console.error("Test connection error:", e);
      toast.error(
        `${t("dashboard.settings.ai.testFailed")}: ${e?.message || "Unknown error"}`
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleApiKeyChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "doubao" | "deepseek" | "openai"
  ) => {
    const newApiKey = e.target.value;
    if (type === "doubao") {
      setDoubaoApiKey(newApiKey);
    } else if (type === "deepseek") {
      setDeepseekApiKey(newApiKey);
    } else {
      setOpenaiApiKey(newApiKey);
    }
  };

  const handleModelIdChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "doubao" | "deepseek" | "openai"
  ) => {
    const newModelId = e.target.value;
    if (type === "doubao") {
      setDoubaoModelId(newModelId);
    } else if (type === "openai") {
      setOpenaiModelId(newModelId);
    }
  };

  const handleApiEndpointChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "openai"
  ) => {
    const newApiEndpoint = e.target.value;
    if (type === "openai") {
      setOpenaiApiEndpoint(newApiEndpoint);
    }
  };

  const models = [
    {
      id: "deepseek",
      name: t("dashboard.settings.ai.deepseek.title"),
      description: t("dashboard.settings.ai.deepseek.description"),
      icon: DeepSeekLogo,
      link: "https://platform.deepseek.com",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
      isConfigured: !!deepseekApiKey
    },
    {
      id: "doubao",
      name: t("dashboard.settings.ai.doubao.title"),
      description: t("dashboard.settings.ai.doubao.description"),
      icon: IconDoubao,
      link: "https://console.volcengine.com/ark",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      isConfigured: !!(doubaoApiKey && doubaoModelId)
    },
    {
      id: "openai",
      name: t("dashboard.settings.ai.openai.title"),
      description: t("dashboard.settings.ai.openai.description"),
      icon: IconOpenAi,
      link: "https://platform.openai.com/api-keys",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      isConfigured: !!(openaiApiKey && openaiModelId && openaiApiEndpoint)
    }
  ];

  return (
    <div className="mx-auto py-4 px-4">
      <div className="flex gap-8">
        <div className="w-64 space-y-6">
          <div>
            <Label className="text-sm mb-2 block text-muted-foreground">
              {t("dashboard.settings.ai.currentModel")}
            </Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("dashboard.settings.ai.selectModel")}
                />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem
                    key={model.id}
                    value={model.id}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <model.icon className={cn("h-4 w-4", model.color)} />
                      <span>{model.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-[1px] bg-gray-200 dark:bg-gray-800" />

          {/* 配置模型列表 */}
          <div className="flex flex-col space-y-1">
            {models.map((model) => {
              const Icon = model.icon;
              const isActive = currentModel === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => setCurrentModel(model.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-left relative",
                    "transition-all duration-200",
                    "hover:bg-primary/10",
                    isActive && "bg-primary/10"
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isActive && "text-primary"
                      )}
                    >
                      {model.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          {models.map(
            (model) =>
              model.id === currentModel && (
                <div key={model.id} className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <div className={cn("shrink-0", model.color)}>
                        <model.icon className="h-6 w-6" />
                      </div>
                      {model.name}
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      {model.description}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">
                          {t(`dashboard.settings.ai.${model.id}.apiKey`)}
                        </Label>
                        <a
                          href={model.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          {t("dashboard.settings.ai.getApiKey")}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <Input
                        value={
                          model.id === "doubao" ? doubaoApiKey : model.id === "openai" ? openaiApiKey : deepseekApiKey
                        }
                        onChange={(e) =>
                          handleApiKeyChange(
                            e,
                            model.id as "doubao" | "deepseek" | "openai"
                          )
                        }
                        type="password"
                        placeholder={t(
                          `dashboard.settings.ai.${model.id}.apiKey`
                        )}
                        className={cn(
                          "h-11",
                          "bg-white dark:bg-gray-900",
                          "border-gray-200 dark:border-gray-800",
                          "focus:ring-2 focus:ring-primary/20"
                        )}
                      />
                    </div>

                    {currentModel === "doubao" && (
                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          {t("dashboard.settings.ai.doubao.modelId")}
                        </Label>
                        <Input
                          value={doubaoModelId}
                          onChange={(e) => handleModelIdChange(e, "doubao")}
                          placeholder={t(
                            "dashboard.settings.ai.doubao.modelId"
                          )}
                          className={cn(
                            "h-11",
                            "bg-white dark:bg-gray-900",
                            "border-gray-200 dark:border-gray-800",
                            "focus:ring-2 focus:ring-primary/20"
                          )}
                        />
                      </div>
                    )}

                    {currentModel === "openai" && (
                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          {t("dashboard.settings.ai.openai.modelId")}
                        </Label>
                        <Input
                          value={openaiModelId}
                          onChange={(e) => handleModelIdChange(e, "openai")}
                          placeholder={t(
                            "dashboard.settings.ai.openai.modelId"
                          )}
                          className={cn(
                            "h-11",
                            "bg-white dark:bg-gray-900",
                            "border-gray-200 dark:border-gray-800",
                            "focus:ring-2 focus:ring-primary/20"
                          )}
                        />
                      </div>
                    )}

                    {currentModel === "openai" && (
                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          {t("dashboard.settings.ai.openai.apiEndpoint")}
                        </Label>
                        <Input
                          value={openaiApiEndpoint}
                          onChange={(e) => handleApiEndpointChange(e, "openai")}
                          placeholder={t(
                            "dashboard.settings.ai.openai.apiEndpoint"
                          )}
                          className={cn(
                            "h-11",
                            "bg-white dark:bg-gray-900",
                            "border-gray-200 dark:border-gray-800",
                            "focus:ring-2 focus:ring-primary/20"
                          )}
                        />
                      </div>
                    )}
                    <div>
                      <Button
                        onClick={handleTestConnection}
                        disabled={isTesting || !currentModel}
                        className={cn("h-11")}
                      >
                        {isTesting
                          ? t("dashboard.settings.ai.testing")
                          : t("dashboard.settings.ai.test")}
                      </Button>
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default AISettingsPage;
