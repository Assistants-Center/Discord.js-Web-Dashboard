module.exports = (db) => {
    return class Category {
        constructor(
            options = { categoryId: "", categoryName: "", categoryDescription: "" }
        ) {
            this.categoryId = options.categoryId
            this.categoryName = options.categoryName
            this.categoryDescription = options.categoryDescription
            this.categoryOptionsList = []

            // const db = Handler.getDB()
            this.db = db
        }

        /**
         *
         * @param {string} id - The id of the category, must be unique
         * @returns
         */
        setId(id) {
            this.categoryId = id

            return this
        }

        /**
         *
         * @param {string} name - The name of the category displayed in the dashboard
         * @returns
         */
        setName(name) {
            this.categoryName = name

            return this
        }

        /**
         *
         * @param {string} description - The description of the category displayed in the dashboard
         * @returns
         */
        setDescription(description) {
            this.categoryDescription = description

            return this
        }

        /**
         *
         * @param {string} image - Set the image for a Soft UI category, must be a link
         * @returns
         */
        setImage(image) {
            this.categoryImageURL = image

            return this
        }

        /**
         *
         * @param {boolean} toggleable - Allows Soft UI category to be toggleable
         * @returns
         */
        setToggleable(toggleable) {
            this.toggleable = toggleable

            this.getActualSet = async ({ guild }) => {
                return await this.db.get(
                    `${guild.id}.categories.${this.categoryId}.toggle`
                )
            }

            this.setNew = async ({ guild, newData }) => {
                await this.db.set(
                    `${guild.id}.categories.${this.categoryId}.toggle`,
                    newData
                )
            }

            return this
        }

        /**
         * @param {import('./Option')[]} options - The options of the category
         * @example
         * new Category()
         * .setId('setup')
         * .setName("Setup")
         * .setDescription("Setup your bot with default settings!")
         * .addOptions(
         *    new Option()
         *   .setId('lang')
         *   .setName("Language")
         *   .setDescription("Change bot's language easily")
         *   .setType(dbd.formTypes.select({"Polish": 'pl', "English": 'en', "French": 'fr'}))
         * )
         */
        addOptions() {
            this.categoryOptionsList.push(...arguments)

            return this
        }

        /**
         * @param {boolean} categorySet
         * @returns
         */
        setCategorySet(categorySet) {
            if (!this?.categoryOptionsList?.length) throw new Error("You must add options by calling .addOptions to the category before setting it as a category set!")
            if (categorySet) {
                this.getActualSet = async ({ guild }) => {
                    let data = await Promise.all(this.categoryOptionsList.map(async (option) => {
                        return {
                            optionId: option.optionId,
                            data: await this.db.get(`${guild.id}.categories.${this.categoryId}.${option.optionId}`),
                        }
                    }))

                    if (this.toggleable)
                        data.push({
                            optionId: "categoryToggle",
                            data: await this.db.get(`${guild.id}.categories.${this.categoryId}.toggle`),
                        })

                    return data
                }

                this.setNew = async ({ guild, data }) => {
                    for (const option of data) {
                        await this.db.set(
                            `${guild.id}.categories.${this.categoryId}.${option.optionId === "categoryToggle" ? "toggle" : option.optionId}`,
                            option.data
                        )
                    }
                }
            }

            return this
        }
    }
}
