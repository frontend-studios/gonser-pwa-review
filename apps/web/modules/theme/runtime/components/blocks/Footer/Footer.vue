<template>
  <div v-if="shouldRender" data-testid="footer">
    <footer class="max-w-screen-2xl mx-auto rounded-[10px] pt-10 px-4 xl:px-10 pb-5 bg-gray-light">
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 xl:gap-8">
        <div class="hidden md:block">
          <p class="font-semibold mb-2">{{ t('theme.footer.contact.headline') }}</p>
          <ul class="space-y-1">
            <li>{{ t('theme.footer.contact.name') }}</li>
            <li>{{ t('theme.footer.contact.street') }}</li>
            <li>{{ t('theme.footer.contact.city') }}</li>
            <li class="mt-2">{{ t('theme.footer.contact.email') }}</li>
          </ul>
        </div>

        <div class="col-span-1 md:col-span-2">
          <div class="flex flex-col md:inline-flex md:flex-row md:items-start md:gap-16">
            <div>
              <p class="font-semibold mb-2">{{ t('theme.footer.links.headline') }}</p>
              <ul class="space-y-1">
                <li v-for="i in 5" :key="i">
                  <a
                    v-if="hasI18nValue(`theme.footer.links.link${i}.url`)"
                    :href="getI18nValue(`theme.footer.links.link${i}.url`)"
                    class="hover:underline text-sm md:text-base"
                  >
                    {{ t(`theme.footer.links.link${i}.text`) }}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p class="font-semibold mb-2 hidden md:block">&nbsp;</p>
              <ul class="space-y-1">
                <li v-for="i in [6, 7, 8, 9, 10]" :key="i">
                  <a
                    v-if="hasI18nValue(`theme.footer.links.link${i}.url`)"
                    :href="getI18nValue(`theme.footer.links.link${i}.url`)"
                    :target="i === 9 ? '_blank' : undefined"
                    :rel="i === 9 ? 'noopener noreferrer' : undefined"
                    class="hover:underline text-sm md:text-base"
                  >
                    {{ t(`theme.footer.links.link${i}.text`) }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-span-1">
          <p class="font-semibold mb-2">{{ t('theme.footer.legal.headline') }}</p>
          <ul class="space-y-1">
            <li v-for="i in 3" :key="i">
              <a
                v-if="hasI18nValue(`theme.footer.legal.link${i}.url`)"
                :href="getI18nValue(`theme.footer.legal.link${i}.url`)"
                class="hover:underline text-sm md:text-base"
              >
                {{ t(`theme.footer.legal.link${i}.text`) }}
              </a>
            </li>
          </ul>
        </div>

        <div class="col-span-1">
          <p class="font-semibold mb-2">{{ t('theme.footer.awards.headline') }}</p>
          <ul class="flex flex-row gap-2 md:gap-4">
            <li v-for="i in 2" :key="i">
              <img
                v-if="hasI18nValue(`theme.footer.awards.award${i}.image`)"
                :src="getI18nValue(`theme.footer.awards.award${i}.image`)"
                :alt="t(`theme.footer.awards.award${i}.alt`)"
                class="w-[70px] h-auto md:h-[151px] md:w-auto"
              />
            </li>
          </ul>
        </div>

        <div class="col-span-1">
          <p class="font-semibold mb-2">{{ t('theme.footer.safety.headline') }}</p>
          <ul>
            <li>
              <img
                v-if="hasI18nValue('theme.footer.safety.image')"
                :src="getI18nValue('theme.footer.safety.image')"
                :alt="t('theme.footer.safety.alt')"
                class="h-[100px] w-auto"
              />
            </li>
          </ul>
        </div>
      </div>

      <hr class="my-6 md:my-8 border-gray-dark" />

      <div class="flex flex-col lg:flex-row lg:justify-between gap-6 xl:gap-8">
        <div class="order-3 lg:order-1 lg:flex-1 text-center lg:text-left">
          <p class="text-gray-super-dark mb-2 md:text-sm xl:text-base">{{ t('theme.footer.copyright.disclaimer') }}</p>
          <p class="mt-3 md:mt-4 md:text-sm xl:text-base">{{ t('theme.footer.copyright.text') }}</p>
        </div>

        <div class="order-1 lg:order-2 lg:flex-1 text-center lg:text-left">
          <p class="font-semibold mb-3">{{ t('theme.footer.payment.headline') }}</p>
          <ul class="flex flex-wrap justify-center lg:justify-start gap-2">
            <li v-for="i in 6" :key="i">
              <img
                v-if="hasI18nValue(`theme.footer.payment.method${i}.image`)"
                :src="getI18nValue(`theme.footer.payment.method${i}.image`)"
                :alt="t(`theme.footer.payment.method${i}.alt`)"
                class="h-[27px] w-auto"
              />
            </li>
          </ul>
        </div>

        <div class="order-2 lg:order-3 lg:flex-1 text-center lg:text-left">
          <p class="font-semibold mb-3">{{ t('theme.footer.socialmedia.headline') }}</p>
          <ul class="flex flex-wrap justify-center lg:justify-start gap-2">
            <li v-for="platform in socialPlatforms" :key="platform.id">
              <a
                :href="platform.url"
                :target="platform.id !== 4 ? '_blank' : undefined"
                :rel="platform.id !== 4 ? 'noopener noreferrer' : undefined"
                class="flex items-center justify-center w-10 h-10 rounded-full bg-gray hover:bg-gray-dark transition-colors"
              >
                <img
                  :src="platform.icon"
                  :alt="t(`theme.footer.socialmedia.platform${platform.id}.alt`)"
                  class="w-5 h-5"
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
interface FooterProps {
  content?: unknown;
}

const props = defineProps<FooterProps>();
const route = useRoute();

const getI18nValue = (key: string) => {
  const value = t(key);
  if (typeof value !== 'string') return '';

  const trimmedValue = value.trim();
  if (!trimmedValue || trimmedValue === key) return '';

  return trimmedValue;
};

const hasI18nValue = (key: string) => !!getI18nValue(key);

const socialPlatforms = computed(() => {
  return Array.from({ length: 5 }, (_, index) => index + 1)
    .map((id) => ({
      id,
      url: getI18nValue(`theme.footer.socialmedia.platform${id}.url`),
      icon: getI18nValue(`theme.footer.socialmedia.platform${id}.icon`),
    }))
    .filter((platform) => platform.url && platform.icon);
});

const shouldRender = computed(() => {
  if (route.meta.isBlockified) return !!props.content;
  return true;
});
</script>
